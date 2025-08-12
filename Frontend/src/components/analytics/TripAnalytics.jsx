import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, Map, Calendar, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TripAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(API_ROUTES.users.stats, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        setAnalytics(response.data.stats);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Sample data for charts when real data is not available
  const sampleBudgetData = {
    labels: ['Transport', 'Stay', 'Activities', 'Meals'],
    datasets: [
      {
        label: 'Budget Breakdown',
        data: [30, 40, 20, 10],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const sampleTripsOverTimeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Trips Created',
        data: [1, 0, 2, 1, 3, 2],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sampleActivityData = {
    labels: ['Sightseeing', 'Adventure', 'Cultural', 'Relaxation', 'Food'],
    datasets: [
      {
        label: 'Activities by Type',
        data: [12, 8, 6, 5, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold">{analytics?.totalTrips || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Map className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Destinations</p>
              <p className="text-2xl font-bold">{analytics?.totalCities || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Map className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Countries</p>
              <p className="text-2xl font-bold">{analytics?.totalCountries || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Map className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Duration</p>
              <p className="text-2xl font-bold">{analytics?.avgTripDuration || 0} <span className="text-sm">days</span></p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Trip Activity Over Time
            </h3>
            <div className="h-64">
              <Line 
                data={sampleTripsOverTimeData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              Budget Allocation
            </h3>
            <div className="h-64 flex justify-center">
              <Doughnut 
                data={sampleBudgetData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-500" />
              Activity Breakdown
            </h3>
            <div className="h-64">
              <Bar 
                data={sampleActivityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TripAnalytics;