import React from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { BedDouble, Image as ImageIcon, CalendarDays, Inbox, Users, Star, Settings } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-sm"></div>)}
      </div>
    </div>;
  }

  const statCards = [
    { label: 'Total Rooms', value: stats?.totalRooms || 0, icon: BedDouble, href: '/admin/rooms' },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Inbox, href: '/admin/bookings' },
    { label: 'Gallery Images', value: stats?.totalGalleryImages || 0, icon: ImageIcon, href: '/admin/gallery' },
    { label: 'Media Files', value: stats?.totalMediaFiles || 0, icon: ImageIcon, href: '/admin/media' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of Neel Kamal Homestay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-card p-6 rounded-sm border border-border shadow-sm hover:shadow-md transition-shadow group flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-serif text-foreground mt-1">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-serif text-xl text-primary">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              stats.recentBookings.map(booking => (
                <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{booking.guestName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 uppercase tracking-wider rounded-sm ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{booking.roomName || 'Any Room'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">No recent bookings</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl text-primary">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href="/admin/rooms" className="flex flex-col items-center justify-center p-6 border border-border rounded-sm hover:bg-muted transition-colors gap-3">
              <BedDouble className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Manage Rooms</span>
            </Link>
            <Link href="/admin/settings" className="flex flex-col items-center justify-center p-6 border border-border rounded-sm hover:bg-muted transition-colors gap-3">
              <Settings className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Update Settings</span>
            </Link>
            <Link href="/admin/gallery" className="flex flex-col items-center justify-center p-6 border border-border rounded-sm hover:bg-muted transition-colors gap-3">
              <ImageIcon className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Manage Gallery</span>
            </Link>
            <Link href="/admin/reviews" className="flex flex-col items-center justify-center p-6 border border-border rounded-sm hover:bg-muted transition-colors gap-3">
              <Star className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Manage Reviews</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}