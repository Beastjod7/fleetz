import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, MapPin, Clock, User, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Update {
  id: string;
  type: 'trip_started' | 'trip_completed' | 'location_update' | 'status_change';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface LiveUpdatesProps {
  isAdmin?: boolean;
  employeeId?: string;
}

const LiveUpdates: React.FC<LiveUpdatesProps> = React.memo(({ isAdmin = false, employeeId }) => {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [isAdmin, employeeId]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifications) {
        const formattedUpdates: Update[] = notifications.map(notif => ({
          id: notif.id,
          type: notif.type as any,
          message: notif.message,
          timestamp: new Date(notif.created_at),
          isRead: notif.is_read
        }));
        setUpdates(formattedUpdates);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setUpdates(prev => 
        prev.map(update => 
          update.id === id ? { ...update, isRead: true } : update
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUpdates(prev => 
        prev.map(update => ({ ...update, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const getUpdateIcon = (type: Update['type']) => {
    switch (type) {
      case 'trip_started':
      case 'trip_completed':
        return <MapPin className="w-4 h-4" />;
      case 'location_update':
        return <Truck className="w-4 h-4" />;
      case 'status_change':
        return <User className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getUpdateColor = (type: Update['type']) => {
    switch (type) {
      case 'trip_started':
        return 'bg-primary text-primary-foreground';
      case 'trip_completed':
        return 'bg-secondary text-secondary-foreground';
      case 'location_update':
        return 'bg-accent text-accent-foreground';
      case 'status_change':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-background text-foreground';
    }
  };

  const unreadCount = useMemo(() => updates.filter(update => !update.isRead).length, [updates]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Updates</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {updates.map((update) => (
          <div
            key={update.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              update.isRead 
                ? 'bg-muted/50 border-border' 
                : 'bg-background border-primary/20 shadow-sm'
            }`}
            onClick={() => markAsRead(update.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${getUpdateColor(update.type)}`}>
                {getUpdateIcon(update.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${update.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {update.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(update.timestamp)}
                  </span>
                  {!update.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {updates.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No updates yet</p>
        </div>
      )}
    </Card>
  );
});

LiveUpdates.displayName = 'LiveUpdates';

export default LiveUpdates;