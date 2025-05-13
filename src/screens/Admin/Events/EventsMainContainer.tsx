import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, User, Package, MessageCircle } from "lucide-react";
import moment from 'moment';
import { getAllBookings, Booking } from '@/services/booking';
import { useToast } from "@/hooks/use-toast";

interface Event {
    id: string;
    title: string;
    requestor: string;
    equipments: { name: string; quantity: number }[];
    start: Date;
    end: Date;
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string;
}

export default function EventsMainContainer() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming');
    const { toast } = useToast();

    // Convert booking from API to our Event format
    const bookingToEvent = (booking: Booking): Event => {
        return {
            id: booking.id?.toString() || '',
            title: booking.activity_title,
            requestor: booking.requestor_name,
            equipments: booking.equipment.map(eq => ({
                name: eq.name,
                quantity: eq.quantity
            })),
            start: new Date(`${booking.start_date} ${booking.start_time}`),
            end: new Date(`${booking.end_date} ${booking.end_time}`),
            status: booking.status,
            remarks: booking.remarks || ''
        };
    };

    // Fetch events from the API
    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const bookings = await getAllBookings();
            const convertedEvents = bookings
                .map(booking => bookingToEvent(booking))
                .filter(event => event.status === 'approved'); // Get only approved events
            setEvents(convertedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast({
                title: 'Error',
                description: 'Failed to load events. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events based on the active filter
    const filteredEvents = events.filter(event => {
        const now = new Date();

        switch (activeFilter) {
            case 'upcoming':
                return event.start >= now;
            case 'today':
                return moment(event.start).isSame(moment(now), 'day');
            case 'all':
            default:
                return true;
        }
    });

    // Sort events by start date
    const sortedEvents = [...filteredEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Group events by month and year
    const eventsByMonth = sortedEvents.reduce((acc, event) => {
        const monthYear = moment(event.start).format('MMMM YYYY');
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Events Calendar</h1>

            <Tabs defaultValue="upcoming" value={activeFilter} onValueChange={(value) => setActiveFilter(value as 'all' | 'upcoming' | 'today')}>
                <div className="flex justify-between items-center mb-6">
                    <TabsList>
                        <TabsTrigger value="upcoming" className="px-4">Upcoming Events</TabsTrigger>
                        <TabsTrigger value="today" className="px-4">Today's Events</TabsTrigger>
                        <TabsTrigger value="all" className="px-4">All Approved Events</TabsTrigger>
                    </TabsList>

                    <Button variant="outline" onClick={fetchEvents}>
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div>
                        {Object.keys(eventsByMonth).length > 0 ? (
                            Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
                                <div key={monthYear} className="mb-10">
                                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">{monthYear}</h2>
                                    <div className="space-y-4">
                                        {monthEvents.map(event => (
                                            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                                                            <CardDescription className="flex items-center">
                                                                <User className="h-4 w-4 mr-1" />
                                                                {event.requestor}
                                                            </CardDescription>
                                                        </div>
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                            Approved
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start">
                                                            <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                                                            <div>
                                                                {moment(event.start).format('YYYY-MM-DD') !== moment(event.end).format('YYYY-MM-DD') ? (
                                                                    <span className="text-gray-700">
                                                                        {moment(event.start).format('MMM D, YYYY')} to {moment(event.end).format('MMM D, YYYY')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-700">
                                                                        {moment(event.start).format('MMM D, YYYY')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start">
                                                            <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                                                            <span className="text-gray-700">
                                                                {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                                                            </span>
                                                        </div>

                                                        {event.equipments.length > 0 && (
                                                            <div className="flex items-start">
                                                                <Package className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                                                                <div className="flex flex-wrap gap-1">
                                                                    {event.equipments.map(eq => (
                                                                        <Badge key={eq.name} variant="outline" className="bg-gray-50">
                                                                            {eq.name} ({eq.quantity})
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {event.remarks && (
                                                            <div className="flex items-start">
                                                                <MessageCircle className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                                                                <p className="text-sm text-gray-600 italic">{event.remarks}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">No events found for this filter</p>
                                <p className="text-gray-400">Try changing your filter or check back later</p>
                            </div>
                        )}
                    </div>
                )}
            </Tabs>
        </div>
    );
}