"use client"

import { Layout } from "@/components/layout/layout"
import { useEffect, useState, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import { 
  ChevronDown, 
  CreditCard, 
  Package, 
  Clock, 
  Target, 
  Inbox, 
  Grid3X3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronRight
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn, getAvatarUrl, getIconUrl, getProjectIconUrl } from "@/lib/utils"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-annotation'

// Add custom tooltip styling
const tooltipStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(4px)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#000',
  fontFamily: 'Inter, sans-serif',
  fontSize: '12px',
  fontWeight: 500
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
)

// Create a custom tooltip plugin
const customTooltip = {
  id: 'customTooltip',
  afterDraw: (chart: any) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const activePoint = chart.tooltip._active[0];
      const { ctx } = chart;
      const { x } = activePoint.element;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;
      
      // Draw vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.stroke();
      ctx.restore();
    }
  }
};

// Fix the tooltip callback for percentage change
const percentageChangeCalculator = (currentValue: number, previousValue: number): string => {
  const percentChange = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
  return `${percentChange}% ${parseFloat(percentChange) > 0 ? 'increase' : 'decrease'} from last week`;
};

// Fix doughnut chart type
type DoughnutDatasetType = {
  data: number[];
  backgroundColor: string[];
  borderWidth: number;
  hoverOffset: number;
};

export default function Dashboard() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [activeRing, setActiveRing] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, content: '', visible: false });
  const [activePerformanceCard, setActivePerformanceCard] = useState<number | null>(null);
  const [activeGaugeSegment, setActiveGaugeSegment] = useState<number | null>(null);
  const [performanceTooltip, setPerformanceTooltip] = useState({ x: 0, y: 0, content: '', visible: false });

  // Ensure theme is only checked after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Updated: Use explicit fallback for server rendering
  const currentTheme = mounted ? (resolvedTheme || theme) : undefined;
  const isDark = mounted ? currentTheme === 'dark' : false;
  
  // Replace conditional renders with display: none to avoid hydration mismatch
  const gridColor = isDark ? 'rgba(75, 85, 99, 0.1)' : 'rgba(209, 213, 219, 0.2)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

  // Chart interaction handlers
  const handleChartClick = (chartId: string) => {
    setActiveChart(chartId);
  };

  // Add utility function for handling interactive chart events
  const handleRingHover = (ringIndex: number, e: React.MouseEvent) => {
    const ringData = [
      { title: 'Marketing', value: 25, trend: '+5.7%', period: 'since last week' },
      { title: 'Products', value: 50, trend: '+12.3%', period: 'since last week' },
      { title: 'Services', value: 75, trend: '+8.4%', period: 'since last week' }
    ];

    // Calculate position relative to the chart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveRing(ringIndex);
    setTooltipData({
      x: x + 20, // Offset slightly from cursor
      y: y - 40,
      content: `${ringData[ringIndex].title}: ${ringData[ringIndex].value}% (${ringData[ringIndex].trend} ${ringData[ringIndex].period})`,
      visible: true
    });
  };

  const handleRingLeave = () => {
    setActiveRing(null);
    setTooltipData(prev => ({ ...prev, visible: false }));
  };

  const handleRingClick = (ringIndex: number) => {
    // Simulate a data action - in a real app, this could navigate to a detailed view
    console.log(`Clicked on ring ${ringIndex}`);
    const categories = ['Marketing', 'Products', 'Services'];
    alert(`Viewing detailed data for ${categories[ringIndex]}`);
  };

  // Common chart options for interactive elements
  const getCommonChartOptions = (chartId: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDark ? '#fff' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#4b5563',
        borderColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.4)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      customTooltip
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    transitions: {
      active: {
        animation: {
          duration: 300
        }
      }
    },
    onClick: () => handleChartClick(chartId)
  });

  // Handle Performance Card interactions
  const handlePerformanceCardHover = (cardIndex: number) => {
    setActivePerformanceCard(cardIndex);
  };

  const handlePerformanceCardLeave = () => {
    setActivePerformanceCard(null);
  };

  const handlePerformanceCardClick = (cardIndex: number) => {
    const categories = ['Processing', 'On Hold', 'Delivered'];
    alert(`Viewing detailed data for ${categories[cardIndex]} orders`);
  };

  // Handle Gauge interactions
  const handleGaugeSegmentHover = (segmentIndex: number, e: React.MouseEvent) => {
    const segmentData = [
      { title: 'Q1 Performance', value: 68, trend: '+8.5%', period: 'since last quarter' },
      { title: 'Q2 Performance', value: 82, trend: '+11.2%', period: 'since last quarter' },
      { title: 'Q3 Performance', value: 75, trend: '+5.8%', period: 'since last quarter' },
      { title: 'Q4 Performance', value: 50, trend: '-3.4%', period: 'since last quarter' }
    ];

    // Calculate position relative to the chart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveGaugeSegment(segmentIndex);
    setPerformanceTooltip({
      x: x + 20,
      y: y - 40,
      content: `${segmentData[segmentIndex].title}: ${segmentData[segmentIndex].value} (${segmentData[segmentIndex].trend} ${segmentData[segmentIndex].period})`,
      visible: true
    });
  };

  const handleGaugeSegmentLeave = () => {
    setActiveGaugeSegment(null);
    setPerformanceTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleGaugeSegmentClick = (segmentIndex: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    alert(`Viewing detailed performance data for ${quarters[segmentIndex]}`);
  };

  return (
    <Layout>
      <div className="container px-2 mx-auto">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-tr from-violet-600 to-violet-500 rounded-2xl p-6 h-64 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="z-10">
                <h2 className="text-xl font-medium mb-1">Welcome Back</h2>
                <h1 className="text-3xl font-bold mb-4">{user?.name || "David"}</h1>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                    <p className="text-xs font-medium text-white/70 mb-1">Budget</p>
                    <p className="text-xl font-bold">$98,450</p>
              </div>
              <div>
                    <p className="text-xs font-medium text-white/70 mb-1">Budget</p>
                    <p className="text-xl font-bold">$2,440</p>
              </div>
            </div>
            </div>
              
              <div className="absolute right-0 bottom-0 transform translate-x-6 translate-y-6">
                <div className="w-32 h-32 rounded-full border-8 border-violet-400/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-8 border-violet-400/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-violet-600"></div>
          </div>
        </div>
              </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-64 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
              <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Revenue Forecast</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overview of Profit</p>
              </div>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">2024</span>
                </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-3 w-3 rounded-full bg-pink-500"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">2023</span>
                </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-3 w-3 rounded-full bg-teal-500"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">2022</span>
                </div>
              </div>
            </div>
              
              <div className="h-48">
                {/* Revenue chart */}
                {mounted && (
                  <Line
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                      datasets: [
                        {
                          label: '2024',
                          data: [120, 115, 80, 70, 90, 85, 110, 90],
                          borderColor: '#3b82f6',
                          backgroundColor: 'transparent',
                          tension: 0.4,
                          borderWidth: 3
                        },
                        {
                          label: '2023',
                          data: [60, 80, 90, 100, 70, 60, 50, 70],
                          borderColor: '#ec4899',
                          backgroundColor: 'transparent',
                          tension: 0.4,
                          borderWidth: 3
                        },
                        {
                          label: '2022',
                          data: [40, 30, 50, 45, 60, 50, 45, 40],
                          borderColor: '#14b8a6',
                          backgroundColor: 'transparent',
                          tension: 0.4,
                          borderWidth: 3
                        }
                      ]
                    }}
                    options={{
                      ...getCommonChartOptions('revenueForecast'),
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: textColor
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: gridColor
                          },
                          ticks: {
                            stepSize: 40,
                            color: textColor
                          }
                        }
                      }
                    }}
                  />
                )}
            </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Customers</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">36,358</p>
                <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium mt-1">-12%</span>
            </div>
            </div>
            
            <div className="h-36">
              {mounted && (
                <Line
                  data={{
                    labels: Array(12).fill(''),
                    datasets: [
                      {
                        data: [30, 40, 35, 50, 35, 40, 30, 40, 30, 50, 38, 45],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.5,
                        borderWidth: 2,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    ...getCommonChartOptions('customers'),
                    scales: {
                      x: {
                        display: false
                      },
                      y: {
                        display: false
                      }
                    }
                  }}
                />
              )}
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Projects</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">78,298</p>
                <span className="inline-block px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded text-xs font-medium mt-1">+31.8%</span>
            </div>
            </div>
            
            <div className="h-36">
              {mounted && (
                <Bar
                  data={{
                    labels: Array(10).fill(''),
                    datasets: [
                      {
                        data: [40, 60, 30, 65, 45, 55, 40, 70, 45, 50],
                        backgroundColor: '#f472b6',
                        borderRadius: 4,
                        barThickness: 8
                      }
                    ]
                  }}
                  options={{
                    ...getCommonChartOptions('projects'),
                    scales: {
                      x: {
                        display: false
                      },
                      y: {
                        display: false
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Projects and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Performance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last check on 25 february</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3">
              <div className="col-span-1">
                {/* Order status cards - vertical stack on left */}
                <div className="space-y-4 mb-3">
                  <div 
                    className={`flex items-center p-2 rounded-xl transition-all duration-200 ${activePerformanceCard === 0 ? 'bg-indigo-900/10' : ''} cursor-pointer`}
                    onMouseEnter={() => handlePerformanceCardHover(0)}
                    onMouseLeave={handlePerformanceCardLeave}
                    onClick={() => handlePerformanceCardClick(0)}
                  >
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-900/30 flex items-center justify-center mr-4 transition-all duration-200 ${activePerformanceCard === 0 ? 'scale-110' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
                  <div>
                      <p className="text-xl font-semibold text-gray-800 dark:text-white">64 new orders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Processing</p>
                  </div>
                </div>

                  <div 
                    className={`flex items-center p-2 rounded-xl transition-all duration-200 ${activePerformanceCard === 1 ? 'bg-pink-900/10' : ''} cursor-pointer`}
                    onMouseEnter={() => handlePerformanceCardHover(1)}
                    onMouseLeave={handlePerformanceCardLeave}
                    onClick={() => handlePerformanceCardClick(1)}
                  >
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg bg-pink-900/30 flex items-center justify-center mr-4 transition-all duration-200 ${activePerformanceCard === 1 ? 'scale-110' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 21C16 18.76 14.21 17 12 17C9.79 17 8 18.76 8 21" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.5 8.5C9.5 8.5 10 10.5 12 10.5C14 10.5 14.5 8.5 14.5 8.5" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
                  <div>
                      <p className="text-xl font-semibold text-gray-800 dark:text-white">4 orders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">On hold</p>
                  </div>
                </div>

                  <div 
                    className={`flex items-center p-2 rounded-xl transition-all duration-200 ${activePerformanceCard === 2 ? 'bg-teal-900/10' : ''} cursor-pointer`}
                    onMouseEnter={() => handlePerformanceCardHover(2)}
                    onMouseLeave={handlePerformanceCardLeave}
                    onClick={() => handlePerformanceCardClick(2)}
                  >
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg bg-teal-900/30 flex items-center justify-center mr-4 transition-all duration-200 ${activePerformanceCard === 2 ? 'scale-110' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.92 12H8" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 12H21.08" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
                  <div>
                      <p className="text-xl font-semibold text-gray-800 dark:text-white">12 orders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 flex flex-col items-center">
                {/* Full circular gauge */}
                <div 
                  className="relative w-40 h-40"
                  onMouseLeave={handleGaugeSegmentLeave}
                >
                  {mounted && (
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      
                      {/* Multi-segment colored ring */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={activeGaugeSegment === 0 ? "#fb7bb9" : "#F472B6"}
                        strokeWidth={activeGaugeSegment === 0 ? "14" : "12"}
                        strokeDasharray="339.3"
                        strokeDashoffset="254.5"
                        strokeLinecap="round"
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => handleGaugeSegmentHover(0, e)}
                        onClick={() => handleGaugeSegmentClick(0)}
                        className="cursor-pointer"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={activeGaugeSegment === 1 ? "#5eead4" : "#2DD4BF"}
                        strokeWidth={activeGaugeSegment === 1 ? "14" : "12"}
                        strokeDasharray="339.3"
                        strokeDashoffset="254.5"
                        strokeLinecap="round"
                        transform="rotate(90, 60, 60)"
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => handleGaugeSegmentHover(1, e)}
                        onClick={() => handleGaugeSegmentClick(1)}
                        className="cursor-pointer"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={activeGaugeSegment === 2 ? "#a5b4fd" : "#818CF8"}
                        strokeWidth={activeGaugeSegment === 2 ? "14" : "12"}
                        strokeDasharray="339.3"
                        strokeDashoffset="254.5"
                        strokeLinecap="round"
                        transform="rotate(180, 60, 60)"
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => handleGaugeSegmentHover(2, e)}
                        onClick={() => handleGaugeSegmentClick(2)}
                        className="cursor-pointer"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={activeGaugeSegment === 3 ? "#fcd34d" : "#FBBF24"}
                        strokeWidth={activeGaugeSegment === 3 ? "14" : "12"}
                        strokeDasharray="339.3"
                        strokeDashoffset="254.5"
                        strokeLinecap="round"
                        transform="rotate(270, 60, 60)"
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => handleGaugeSegmentHover(3, e)}
                        onClick={() => handleGaugeSegmentClick(3)}
                        className="cursor-pointer"
                      />
                    </svg>
                  )}
                  <motion.div 
                    className="absolute inset-0 flex justify-center items-center"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeGaugeSegment !== null ? 1.05 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-5xl font-semibold text-white">275</span>
                  </motion.div>
                  
                  {/* Tooltip */}
                  {performanceTooltip.visible && (
                    <div 
                      className="absolute bg-gray-800 text-white text-xs py-2 px-3 rounded-md shadow-lg z-10"
                      style={{ 
                        left: `${performanceTooltip.x}px`, 
                        top: `${performanceTooltip.y}px`,
                        transform: 'translate(-50%, -100%)',
                        pointerEvents: 'none'
                      }}
                    >
                      {performanceTooltip.content}
                      <div className="absolute bottom-0 left-1/2 transform translate-x-[-50%] translate-y-[50%] rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6 max-w-[200px]">
                  Learn insigs how to manage all aspects of your startup.
                </p>
            </div>
          </div>
        </div>

          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Customers</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">+26.5%</span>
            </div>
            </div>
            
            <div className="h-48 mb-8">
              {mounted && (
                <Line
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                      {
                        label: 'Current Week',
                        data: [5000, 8000, 6000, 9000, 7000, 9500, 8500],
                        borderColor: '#818cf8',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#818cf8',
                        pointHoverBorderColor: isDark ? '#1e293b' : '#ffffff',
                        pointHoverBorderWidth: 2,
                        fill: false
                      },
                      {
                        label: 'Previous Week',
                        data: [4200, 6800, 5100, 7600, 5900, 8000, 7200],
                        borderColor: '#818cf850',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#818cf850',
                        pointHoverBorderColor: isDark ? '#1e293b' : '#ffffff',
                        pointHoverBorderWidth: 2,
                        fill: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        mode: 'index' as const,
                        intersect: false,
                        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: isDark ? '#fff' : '#111827',
                        bodyColor: isDark ? '#e5e7eb' : '#4b5563',
                        borderColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.4)',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4,
                        usePointStyle: true,
                        callbacks: {
                          title: (context) => {
                            return context[0].label;
                          },
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                            }
                            return label;
                          },
                          labelTextColor: (context) => {
                            return isDark ? '#e5e7eb' : '#4b5563';
                          },
                          afterBody: (tooltipItems) => {
                            const currentValue = tooltipItems[0].parsed.y;
                            const previousValue = tooltipItems.length > 1 ? tooltipItems[1].parsed.y : 0;
                            
                            if (previousValue > 0) {
                              const diff = currentValue - previousValue;
                              const percentDiff = (diff / previousValue * 100).toFixed(1);
                              const sign = diff > 0 ? '+' : '';
                              return [`${sign}${percentDiff}% from previous week`];
                            }
                            return [];
                          }
                        }
                      }
                    },
                                          scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            display: true,
                            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                            font: {
                              size: 9
                            },
                            maxRotation: 0
                          }
                        },
                      y: {
                        display: false
                      }
                    },
                    elements: {
                      line: {
                        tension: 0.4
                      }
                    },
                    interaction: {
                      mode: 'nearest' as const,
                      axis: 'x' as const,
                      intersect: false
                    }
                  }}
                />
              )}
              </div>
            
            <div className="grid grid-cols-2 gap-x-8 mt-2">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-3"></span>
                <div>
                  <p className="text-xs text-gray-400 mb-1">April 07 - April 14</p>
                  <p className="text-lg font-bold text-gray-100">6,380</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-300/50 mr-3"></span>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last Week</p>
                  <p className="text-lg font-bold text-gray-100">4,298</p>
              </div>
            </div>
          </div>
        </div>

          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Sales Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
              </div>
            
            {/* Sales Overview - Full Circle Multi-Ring Chart */}
            <div className="h-64 flex justify-center items-center mb-4 relative">
              <div 
                className="w-64 h-64 relative"
                onMouseLeave={handleRingLeave}
              >
                {mounted && (
                  <svg viewBox="0 0 240 240" className="w-full h-full">
                    {/* Background circles */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="80"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    
                    {/* Outer Blue Ring - 75% */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke={activeRing === 2 ? "#a5b4fd" : "#818CF8"}
                      strokeWidth={activeRing === 2 ? "18" : "16"}
                      strokeDasharray="628"
                      strokeDashoffset="157" 
                      strokeLinecap="round"
                      transform="rotate(-90 120 120)"
                      style={{ transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => handleRingHover(2, e)}
                      onClick={() => handleRingClick(2)}
                      className="cursor-pointer"
                    />
                    
                    {/* Middle Teal Ring - 50% */}
                    <circle
                      cx="120"
                      cy="120"
                      r="80"
                      fill="none"
                      stroke={activeRing === 1 ? "#5eead4" : "#2DD4BF"}
                      strokeWidth={activeRing === 1 ? "18" : "16"}
                      strokeDasharray="502.4"
                      strokeDashoffset="251.2" 
                      strokeLinecap="round"
                      transform="rotate(-90 120 120)"
                      style={{ transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => handleRingHover(1, e)}
                      onClick={() => handleRingClick(1)}
                      className="cursor-pointer"
                    />
                    
                    {/* Inner Pink Ring - 25% */}
                    <circle
                      cx="120"
                      cy="120"
                      r="60"
                      fill="none"
                      stroke={activeRing === 0 ? "#fb7bb9" : "#F472B6"}
                      strokeWidth={activeRing === 0 ? "18" : "16"}
                      strokeDasharray="376.8"
                      strokeDashoffset="282.6" 
                      strokeLinecap="round"
                      transform="rotate(-90 120 120)"
                      style={{ transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => handleRingHover(0, e)}
                      onClick={() => handleRingClick(0)}
                      className="cursor-pointer"
                    />
                    
                    {/* Percentage markers */}
                    <text x="120" y="10" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)">0%</text>
                    <text x="230" y="120" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)">25%</text>
                    <text x="120" y="235" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)">50%</text>
                    <text x="10" y="120" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.7)">75%</text>
                  </svg>
                )}
                
                {/* Tooltip */}
                {tooltipData.visible && (
                  <div 
                    className="absolute bg-gray-800 text-white text-xs py-2 px-3 rounded-md shadow-lg z-10"
                    style={{ 
                      left: `${tooltipData.x}px`, 
                      top: `${tooltipData.y}px`,
                      transform: 'translate(-50%, -100%)',
                      pointerEvents: 'none'
                    }}
                  >
                    {tooltipData.content}
                    <div className="absolute bottom-0 left-1/2 transform translate-x-[-50%] translate-y-[50%] rotate-45 w-2 h-2 bg-gray-800"></div>
            </div>
                )}
            </div>
              </div>
            
            {/* Add interactive legend for Sales Overview */}
            <div className="grid grid-cols-3 gap-x-4">
              {[
                { color: 'bg-pink-400', hover: 'bg-pink-300', title: 'Marketing', value: '25%', index: 0 },
                { color: 'bg-teal-400', hover: 'bg-teal-300', title: 'Products', value: '50%', index: 1 },
                { color: 'bg-indigo-400', hover: 'bg-indigo-300', title: 'Services', value: '75%', index: 2 }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex flex-col items-center cursor-pointer group"
                  onMouseEnter={(e) => handleRingHover(item.index, e)}
                  onMouseLeave={handleRingLeave}
                  onClick={() => handleRingClick(item.index)}
                >
                  <div className="flex items-center mb-1">
                    <span className={`inline-block w-3 h-3 rounded-full ${activeRing === item.index ? item.hover : item.color} mr-2 transition-colors`}></span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{item.title}</span>
            </div>
                  <p className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Product and Total Settlements in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue by Product */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Revenue by Product</h2>
                <div className="relative">
                  <button className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                <span>Sep 2024</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
              </div>
            </div>

              <div className="mb-8 flex space-x-3">
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center">
                  <Grid3X3 size={16} className="mr-2" />
                App
              </button>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
                  <Package size={16} className="mr-2" />
                Mobile
              </button>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
                  <Target size={16} className="mr-2" />
                SaaS
              </button>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
                  <Inbox size={16} className="mr-2" />
                Others
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Progress</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-5">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-orange-100/10 mr-3 overflow-hidden flex items-center justify-center">
                            <Image
                              src={getProjectIconUrl("minecraft-app", 40)}
                              width={40}
                              height={40}
                              alt="Project Icon"
                              className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-800 dark:text-white">Minecraf App</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Jason Roy</p>
                        </div>
                      </div>
                    </td>
                      <td className="px-4 py-5">
                        <p className="text-gray-800 dark:text-white font-medium">73.2%</p>
                    </td>
                      <td className="px-4 py-5">
                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                        Medium
                      </span>
                    </td>
                      <td className="px-4 py-5 text-base font-medium text-gray-800 dark:text-white">$3.5K</td>
                  </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-5">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-pink-100/10 mr-3 overflow-hidden flex items-center justify-center">
                          <Image
                              src={getProjectIconUrl("web-app-project", 40)}
                              width={40}
                              height={40}
                              alt="Project Icon"
                              className="object-cover"
                          />
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-800 dark:text-white">Web App Project</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mathew Flintoff</p>
                        </div>
                      </div>
                    </td>
                      <td className="px-4 py-5">
                        <p className="text-gray-800 dark:text-white font-medium">73.2%</p>
                    </td>
                      <td className="px-4 py-5">
                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                        Very High
                      </span>
                    </td>
                      <td className="px-4 py-5 text-base font-medium text-gray-800 dark:text-white">$24.5K</td>
                  </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-5">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100/10 mr-3 overflow-hidden flex items-center justify-center">
                          <Image
                              src={getProjectIconUrl("modernize-dashboard", 40)}
                              width={40}
                              height={40}
                              alt="Project Icon"
                              className="object-cover"
                          />
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-800 dark:text-white">Modernize Dashboard</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Anil Kumar</p>
                        </div>
                      </div>
                    </td>
                      <td className="px-4 py-5">
                        <p className="text-gray-800 dark:text-white font-medium">73.2%</p>
                    </td>
                      <td className="px-4 py-5">
                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        Low
                      </span>
                    </td>
                      <td className="px-4 py-5 text-base font-medium text-gray-800 dark:text-white">$12.8K</td>
                  </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-5">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gray-100/10 mr-3 overflow-hidden flex items-center justify-center">
                            <Image
                              src={getProjectIconUrl("dashboard-co", 40)}
                              width={40}
                              height={40}
                              alt="Project Icon"
                              className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-base font-medium text-gray-800 dark:text-white">Dashboard Co</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">George Cruize</p>
                        </div>
                      </div>
                    </td>
                      <td className="px-4 py-5">
                        <p className="text-gray-800 dark:text-white font-medium">73.2%</p>
                    </td>
                      <td className="px-4 py-5">
                        <span className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        High
                      </span>
                    </td>
                      <td className="px-4 py-5 text-base font-medium text-gray-800 dark:text-white">$2.4K</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* Total Settlements Widget */}
          <div className="lg:col-span-1">
            <div className="bg-indigo-100 dark:bg-indigo-100 rounded-2xl p-6 shadow-sm h-full">
              <div className="flex items-start mb-10">
                <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center mr-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.7L3.4 16.5L3 16.3V7.7L3.4 7.5L12 2.3L20.6 7.5L21 7.7V16.3L20.6 16.5L12 21.7Z" stroke="#6366F1" strokeWidth="2" />
                    <path d="M12 13L12 21" stroke="#6366F1" strokeWidth="2" />
                    <path d="M3 7.5L12 13L21 7.5" stroke="#6366F1" strokeWidth="2" />
                  </svg>
              </div>
              <div>
                  <p className="text-base font-medium text-indigo-600">Total settlements</p>
                  <p className="text-3xl font-bold text-gray-900">$122,580</p>
              </div>
              </div>
              
              <div className="h-60 mb-10 relative" id="settlementsChart">
                {mounted && (
                  <>
                    {/* Add subtle grid */}
                    <div className="absolute inset-x-0 h-full flex justify-between z-0">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-full w-px bg-indigo-200/20"></div>
                      ))}
            </div>
                    
                    <Line
                      data={{
                        labels: ['1W', '3W', '5W', '7W', '9W', '11W', '13W', '15W'],
                        datasets: [
                          {
                            data: [22000, 55000, 25000, 15000, 5000, 15000, 45000, 65000],
                            borderColor: '#6366F1',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            fill: false,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            enabled: false // Disable default tooltip
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              color: '#a5b4fc',
                              font: {
                                size: 10
                              }
                            }
                          },
                          y: {
                            display: false,
                            beginAtZero: false
                          }
                        },
                        elements: {
                          line: {
                            tension: 0.4,
                          }
                        },
                        interaction: {
                          mode: 'index',
                          intersect: false
                        }
                      }}
                    />
                    
                    {/* Week labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-indigo-400 px-2">
                      <span>1W</span>
                      <span>3W</span>
                      <span>5W</span>
                      <span>7W</span>
                      <span>9W</span>
                      <span>11W</span>
                      <span>13W</span>
                      <span>15W</span>
                    </div>
                    
                    {/* Interactive tooltip area */}
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      id="chartInteractionArea"
                      onMouseMove={(e) => {
                        // Get chart area dimensions
                        const chart = document.getElementById('settlementsChart');
                        if (!chart) return;
                        
                        const chartRect = chart.getBoundingClientRect();
                        const x = e.clientX - chartRect.left;
                        const xPercent = x / chartRect.width;
                        
                        // Simple tooltip positioning logic based on cursor x position
                        let week = '1W';
                        let settlements = 22;
                        
                        if (xPercent < 0.125) {
                          week = '1W';
                          settlements = 22;
                        } else if (xPercent < 0.25) {
                          week = '3W';
                          settlements = 55;
                        } else if (xPercent < 0.375) {
                          week = '5W';
                          settlements = 25;
                        } else if (xPercent < 0.5) {
                          week = '7W';
                          settlements = 15;
                        } else if (xPercent < 0.625) {
                          week = '9W';
                          settlements = 5;
                        } else if (xPercent < 0.75) {
                          week = '11W';
                          settlements = 15;
                        } else if (xPercent < 0.875) {
                          week = '13W';
                          settlements = 45;
                        } else {
                          week = '15W';
                          settlements = 65;
                        }
                        
                        // Find or create tooltip element
                        let tooltip = document.getElementById('chartTooltip');
                        if (!tooltip) {
                          tooltip = document.createElement('div');
                          tooltip.id = 'chartTooltip';
                          tooltip.className = 'absolute bg-indigo-100 text-gray-800 text-sm py-3 px-4 rounded-lg shadow-md z-20 transition-all duration-200 opacity-0 pointer-events-none';
                          chart.appendChild(tooltip);
                        }
                        
                        // Update tooltip content and position
                        tooltip.innerHTML = `
                          <div class="font-semibold">${week}</div>
                          <div class="flex items-center mt-1">
                            <span class="w-2 h-2 bg-indigo-500 inline-block mr-2"></span>
                            <span>settlements: ${settlements}K</span>
                          </div>
                        `;
                        
                        // Position tooltip to follow cursor but stay within chart bounds
                        const tooltipWidth = 150; // Approximate width
                        const leftPos = Math.min(Math.max(x, tooltipWidth/2), chartRect.width - tooltipWidth/2);
                        
                        tooltip.style.left = `${leftPos}px`;
                        tooltip.style.top = `${e.clientY - chartRect.top - 20}px`;
                        tooltip.style.transform = 'translate(-50%, -100%)';
                        tooltip.style.opacity = '1';
                      }}
                      onMouseLeave={() => {
                        // Hide dynamic tooltip when mouse leaves chart area
                        const tooltip = document.getElementById('chartTooltip');
                        if (tooltip) {
                          tooltip.style.opacity = '0';
                        }
                      }}
                    />
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-base font-medium text-indigo-600">Total balance</p>
                  <p className="text-3xl font-bold text-gray-900">$122,580</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-indigo-600">Withdrawals</p>
                  <p className="text-3xl font-bold text-gray-900">$31,640</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
