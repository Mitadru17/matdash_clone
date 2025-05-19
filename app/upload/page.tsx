"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Layout } from "@/components/layout/layout"
import { Upload, X, FileText, Image as ImageIcon, Video, CheckCircle2 } from "lucide-react"

type FileWithPreview = {
  file: File
  preview: string
  type: "video" | "subtitle" | "image"
  error?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const subtitleRef = useRef<HTMLTrackElement>(null)

  // Video file handler
  const onDropVideo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const isValidVideo = /\.(mp4|avi|mov|wmv|mkv)$/i.test(file.name)
    
    if (!isValidVideo) {
      setFiles(prev => [
        ...prev.filter(f => f.type !== "video"),
        {
          file,
          preview: "",
          type: "video",
          error: "Invalid video format. Please upload .mp4, .avi, .mov, .wmv, or .mkv files."
        }
      ])
      return
    }

    const preview = URL.createObjectURL(file)
    
    setFiles(prev => {
      // Remove any previous video
      const filtered = prev.filter(f => f.type !== "video")
      return [
        ...filtered,
        {
          file,
          preview,
          type: "video"
        }
      ]
    })
  }, [])

  // Subtitle file handler
  const onDropSubtitle = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const isValidSubtitle = /\.(srt|vtt)$/i.test(file.name)
    
    if (!isValidSubtitle) {
      setFiles(prev => [
        ...prev.filter(f => f.type !== "subtitle"),
        {
          file,
          preview: "",
          type: "subtitle",
          error: "Invalid subtitle format. Please upload .srt or .vtt files."
        }
      ])
      return
    }

    const preview = URL.createObjectURL(file)
    
    setFiles(prev => {
      // Remove any previous subtitle
      const filtered = prev.filter(f => f.type !== "subtitle")
      return [
        ...filtered,
        {
          file,
          preview,
          type: "subtitle"
        }
      ]
    })

    // If we have a video and subtitle, connect them
    if (videoRef.current && subtitleRef.current) {
      subtitleRef.current.src = preview
    }
  }, [])

  // Image file handler
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const isValidImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    
    if (!isValidImage) {
      setFiles(prev => [
        ...prev.filter(f => f.type !== "image"),
        {
          file,
          preview: "",
          type: "image",
          error: "Invalid image format. Please upload .jpg, .jpeg, .png, .gif, or .webp files."
        }
      ])
      return
    }

    const preview = URL.createObjectURL(file)
    
    setFiles(prev => {
      // Remove any previous image
      const filtered = prev.filter(f => f.type !== "image")
      return [
        ...filtered,
        {
          file,
          preview,
          type: "image"
        }
      ]
    })
  }, [])

  // Dropzone configurations
  const videoDropzone = useDropzone({
    onDrop: onDropVideo,
    maxFiles: 1,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.mkv']
    }
  })

  const subtitleDropzone = useDropzone({
    onDrop: onDropSubtitle,
    maxFiles: 1,
    accept: {
      'text/plain': ['.srt', '.vtt']
    }
  })

  const imageDropzone = useDropzone({
    onDrop: onDropImage,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    }
  })

  // Cleanup function for object URLs to avoid memory leaks
  const removeFile = (fileToRemove: FileWithPreview) => {
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview)
    setFiles(files.filter(file => file.type !== fileToRemove.type))
  }

  // Get file by type helper
  const getFileByType = (type: "video" | "subtitle" | "image") => {
    return files.find(file => file.type === type)
  }

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Video Uploader</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Upload sections */}
          <div className="space-y-6">
            {/* Video upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Video className="mr-2 h-5 w-5 text-violet-500" />
                Upload Video
              </h2>
              
              <div 
                {...videoDropzone.getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  videoDropzone.isDragActive 
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20" 
                    : "border-gray-300 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500"
                }`}
              >
                <input {...videoDropzone.getInputProps()} />
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getFileByType("video") && !getFileByType("video")?.error
                      ? getFileByType("video")?.file.name 
                      : "Drag and drop your video here, or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports: MP4, AVI, MOV, WMV, MKV
                  </p>
                </div>
              </div>
              
              {getFileByType("video")?.error && (
                <div className="mt-2 text-red-500 text-sm">
                  {getFileByType("video")?.error}
                </div>
              )}
            </div>
            
            {/* Subtitle upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Upload Subtitles
              </h2>
              
              <div 
                {...subtitleDropzone.getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  subtitleDropzone.isDragActive 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                }`}
              >
                <input {...subtitleDropzone.getInputProps()} />
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getFileByType("subtitle") && !getFileByType("subtitle")?.error
                      ? getFileByType("subtitle")?.file.name 
                      : "Drag and drop subtitle file here, or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports: SRT, VTT
                  </p>
                </div>
              </div>
              
              {getFileByType("subtitle")?.error && (
                <div className="mt-2 text-red-500 text-sm">
                  {getFileByType("subtitle")?.error}
                </div>
              )}
            </div>
            
            {/* Image upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-pink-500" />
                Upload Thumbnail
              </h2>
              
              <div 
                {...imageDropzone.getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  imageDropzone.isDragActive 
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20" 
                    : "border-gray-300 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500"
                }`}
              >
                <input {...imageDropzone.getInputProps()} />
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getFileByType("image") && !getFileByType("image")?.error
                      ? getFileByType("image")?.file.name 
                      : "Drag and drop image here, or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>
              
              {getFileByType("image")?.error && (
                <div className="mt-2 text-red-500 text-sm">
                  {getFileByType("image")?.error}
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Previews */}
          <div className="space-y-6">
            {/* Video preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Video Preview</h2>
              
              {getFileByType("video") && !getFileByType("video")?.error ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    src={getFileByType("video")?.preview} 
                    className="w-full h-full object-contain"
                    controls
                  >
                    {getFileByType("subtitle") && !getFileByType("subtitle")?.error && (
                      <track 
                        ref={subtitleRef}
                        kind="subtitles" 
                        src={getFileByType("subtitle")?.preview} 
                        srcLang="en" 
                        label="English" 
                        default 
                      />
                    )}
                  </video>
                  
                  <button 
                    onClick={() => removeFile(getFileByType("video")!)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No video selected</p>
                </div>
              )}
              
              {getFileByType("video") && !getFileByType("video")?.error && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{getFileByType("video")?.file.name}</span>
                  <span className="ml-2">({formatFileSize(getFileByType("video")?.file.size || 0)})</span>
                </div>
              )}
            </div>
            
            {/* Subtitle preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subtitle Preview</h2>
              
              {getFileByType("subtitle") && !getFileByType("subtitle")?.error ? (
                <div className="relative">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
                    <p className="text-gray-800 dark:text-gray-200 break-all">
                      {getFileByType("subtitle")?.file.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      {formatFileSize(getFileByType("subtitle")?.file.size || 0)}
                    </p>
                    <div className="mt-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-green-600 dark:text-green-400 text-xs">Subtitle file validated successfully</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFile(getFileByType("subtitle")!)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No subtitle file selected</p>
                </div>
              )}
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Note: Subtitles will appear in the video player when both video and subtitle files are selected.
              </p>
            </div>
            
            {/* Image preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Thumbnail Preview</h2>
              
              {getFileByType("image") && !getFileByType("image")?.error ? (
                <div className="relative">
                  <img 
                    src={getFileByType("image")?.preview} 
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <button 
                    onClick={() => removeFile(getFileByType("image")!)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No image selected</p>
                </div>
              )}
              
              {getFileByType("image") && !getFileByType("image")?.error && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{getFileByType("image")?.file.name}</span>
                  <span className="ml-2">({formatFileSize(getFileByType("image")?.file.size || 0)})</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button 
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            onClick={() => {
              // This would typically be where you'd submit the files to your backend
              // For this demo, just show an alert with the files that would be uploaded
              const videoFile = getFileByType("video");
              const subtitleFile = getFileByType("subtitle");
              const imageFile = getFileByType("image");
              
              if (!videoFile && !subtitleFile && !imageFile) {
                alert("Please upload at least one file.");
                return;
              }
              
              alert(`Files validated and ready for upload:
${videoFile && !videoFile.error ? `Video: ${videoFile.file.name} (${formatFileSize(videoFile.file.size)})` : 'No video'}
${subtitleFile && !subtitleFile.error ? `Subtitle: ${subtitleFile.file.name} (${formatFileSize(subtitleFile.file.size)})` : 'No subtitle'}
${imageFile && !imageFile.error ? `Image: ${imageFile.file.name} (${formatFileSize(imageFile.file.size)})` : 'No image'}`);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </Layout>
  )
}
