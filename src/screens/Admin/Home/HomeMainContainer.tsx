import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, Calendar as CalendarIcon, List, Info } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllBookings, createBooking, updateBooking, deleteBooking, Booking, Equipment as ApiEquipment } from '@/services/booking';
import { Separator } from "@/components/ui/separator";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

// Define interfaces
interface Equipment {
    name: string;
    quantity: number;
    isCustom?: boolean;
}
interface Event {
    id: string;
    title: string;
    requestor: string;
    equipments: Equipment[];
    start: Date;
    end: Date;
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string; // Add remarks field
}

// Constants
const PREDEFINED_EQUIPMENT = [
    "Projector",
    "Laptop",
    "Microphone",
    "Speakers",
    "Whiteboard",
    "Extension Cord",
    "Others"
];

// Helper Functions
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
        end: new Date(`${booking.start_date} ${booking.end_time}`), // Use start_date for the end time on the same day
        status: booking.status,
        remarks: booking.remarks || ''
    };
};

const eventToBooking = (event: Event, userId: number = 1): Omit<Booking, 'id'> => {
    return {
        start_date: moment(event.start).format('YYYY-MM-DD'),
        end_date: moment(event.end).format('YYYY-MM-DD'), // For single-day events this will be the same as start_date
        activity_title: event.title,
        requestor_name: event.requestor,
        start_time: moment(event.start).format('HH:mm A'),
        end_time: moment(event.end).format('HH:mm A'),
        equipment: event.equipments.map(eq => ({
            name: eq.name,
            quantity: eq.quantity
        })),
        user: userId,
        remarks: event.remarks || '',
        status: event.status
    };
};

const HomeMainContainer = () => {
    // User role state
    const [isAdmin, setIsAdmin] = useState(true); // Set to false for regular users

    // Calendar and event states
    const [events, setEvents] = useState<Event[]>([]);
    const [clickedDates, setClickedDates] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Activity management states
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isAllActivitiesModalOpen, setIsAllActivitiesModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    // Form states
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [activityTitle, setActivityTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [timeError, setTimeError] = useState<string | null>(null);
    const [requestor, setRequestor] = useState('');
    const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);
    const [customEquipment, setCustomEquipment] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

    // Edit and delete states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    // First, add this state variable at the top of your component where other states are defined
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

    const [remarks, setRemarks] = useState('');


    const { toast } = useToast();

    // Side Effects
    useEffect(() => {
        fetchBookings();
    }, []);

    // API Handlers
    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const bookings = await getAllBookings();
            const convertedEvents = bookings.map(booking => bookingToEvent(booking));
            setEvents(convertedEvents);

            // Update clicked dates based on fetched events
            const newClickedDates = new Set<string>();
            convertedEvents.forEach(event => {
                const dateStr = moment(event.start).format('YYYY-MM-DD');
                newClickedDates.add(dateStr);
            });
            setClickedDates(newClickedDates);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load bookings. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Activity Management Functions
    const openAddActivityModal = () => {
        setIsEditMode(false);
        setEditingEvent(null);
        const today = new Date();
        setSelectedStartDate(today); // Default to today's date
        setSelectedEndDate(today); // Default end date to same as start date
        setTimeError(null);

        // Reset form fields
        setActivityTitle('');
        setRequestor('');
        setStartTime('09:00');
        setEndTime('10:00');
        setSelectedEquipments([]);

        // Always default to pending for new activities
        setStatus('pending');

        setIsActivityModalOpen(true);
    };

    const handleEditActivity = (event: Event) => {
        setIsEditMode(true);
        setEditingEvent(event);
        setSelectedStartDate(event.start);
        setSelectedEndDate(event.end); // Now using the actual end date
        setTimeError(null);

        // Fill form with existing activity data
        setActivityTitle(event.title);
        setRequestor(event.requestor);
        setStartTime(moment(event.start).format('HH:mm'));
        setEndTime(moment(event.end).format('HH:mm'));
        setSelectedEquipments([...event.equipments]);
        setStatus(event.status);
        setRemarks(event.remarks || ''); // Set remarks

        setIsActivityModalOpen(true);
        setIsAllActivitiesModalOpen(false);
    };

    const handleDeleteConfirm = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteConfirmOpen(true);
    };

    const deleteActivity = async () => {
        if (!eventToDelete) return;

        try {
            await deleteBooking(parseInt(eventToDelete));

            // Update local state
            setEvents(events.filter(event => event.id !== eventToDelete));

            toast({
                title: "Activity deleted",
                description: "The activity has been removed from the calendar",
            });

            // Update clicked dates if needed (if no more events on that date)
            const eventToRemove = events.find(e => e.id === eventToDelete);
            if (eventToRemove) {
                // Check if we need to update clickedDates
                const dateStr = moment(eventToRemove.start).format('YYYY-MM-DD');
                const eventsOnDate = events.filter(event => {
                    return moment(event.start).format('YYYY-MM-DD') === dateStr && event.id !== eventToDelete;
                });

                if (eventsOnDate.length === 0) {
                    const newClickedDates = new Set(clickedDates);
                    newClickedDates.delete(dateStr);
                    setClickedDates(newClickedDates);
                }
            }
        } catch (error) {
            console.error('Failed to delete booking:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete the booking. Please try again.',
                variant: 'destructive'
            });
        } finally {
            // Reset delete-related state
            setEventToDelete(null);
            setDeleteConfirmOpen(false);
        }
    };

    // Form Validation Functions
    const hasTimeConflict = (
        checkDate: moment.Moment,
        newStart: string,
        newEnd: string
    ): boolean => {
        const dateStr = moment(checkDate).format('YYYY-MM-DD');
        const dateEvents = events.filter(event => moment(event.start).format('YYYY-MM-DD') === dateStr);

        const checkStartTime = moment(`${dateStr} ${newStart}`);
        const checkEndTime = moment(`${dateStr} ${newEnd}`);

        return dateEvents.some(event => {
            // Skip checking against the event being edited
            if (isEditMode && editingEvent && event.id === editingEvent.id) {
                return false;
            }

            const existingStart = moment(event.start);
            const existingEnd = moment(event.end);

            // Check if times are exactly the same
            if (checkStartTime.format('HH:mm') === existingStart.format('HH:mm') &&
                checkEndTime.format('HH:mm') === existingEnd.format('HH:mm')) {
                return true;
            }

            // Check if the new event overlaps with any existing event
            return (
                (checkStartTime.isSameOrAfter(existingStart) && checkStartTime.isBefore(existingEnd)) ||
                (checkEndTime.isAfter(existingStart) && checkEndTime.isSameOrBefore(existingEnd)) ||
                (checkStartTime.isBefore(existingStart) && checkEndTime.isAfter(existingEnd))
            );
        });
    };

    const validateTimeInputs = (): boolean => {
        // Check if end time is after start time
        if (startTime >= endTime) {
            setTimeError("End time must be after start time");
            return false;
        }

        if (!selectedStartDate || !selectedEndDate) return false;

        // For new activities, check for conflicts on each day in the range
        if (!isEditMode) {
            const startDate = moment(selectedStartDate);
            const endDate = moment(selectedEndDate);
            const daysDiff = endDate.diff(startDate, 'days') + 1;

            for (let i = 0; i < daysDiff; i++) {
                const currentDate = moment(selectedStartDate).add(i, 'days');

                // Check for conflicts on this specific date
                if (hasTimeConflict(currentDate, startTime, endTime)) {
                    setTimeError(`Time conflict on ${currentDate.format('MMM D')}. Please select different times.`);
                    return false;
                }
            }
        } else {
            // For editing, only check the start date for conflicts
            if (hasTimeConflict(moment(selectedStartDate), startTime, endTime)) {
                setTimeError("This time conflicts with an existing activity");
                return false;
            }
        }

        setTimeError(null);
        return true;
    };

    // Form Submission Handlers
    // Update the handleAddActivity function to create only one event for a date range

    // Form Submission Handlers
    const handleAddActivity = async () => {
        if (!selectedStartDate || !selectedEndDate || !activityTitle.trim() || !requestor.trim()) {
            setTimeError("Please fill in all required fields");
            return;
        }

        // Validate date range
        if (selectedEndDate < selectedStartDate) {
            setTimeError("End date cannot be before start date");
            return;
        }

        // Validate time inputs before proceeding
        if (!validateTimeInputs()) return;

        try {
            if (isEditMode && editingEvent) {
                // Update existing event
                const updatedEvent: Event = {
                    ...editingEvent,
                    title: activityTitle,
                    requestor: requestor,
                    equipments: selectedEquipments,
                    start: moment(`${moment(selectedStartDate).format('YYYY-MM-DD')} ${startTime}`).toDate(),
                    end: moment(`${moment(selectedEndDate).format('YYYY-MM-DD')} ${endTime}`).toDate(),
                    status: isAdmin ? status : 'pending',
                    remarks: remarks
                };

                const bookingData = eventToBooking(updatedEvent);
                await updateBooking(parseInt(editingEvent.id), bookingData);

                // Update local state
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === editingEvent.id ? updatedEvent : event
                    )
                );

                toast({
                    title: "Activity updated",
                    description: `'${activityTitle}' has been updated`,
                });
            } else {
                // Create a single event for the entire date range
                const startDate = moment(selectedStartDate);
                const endDate = moment(selectedEndDate);

                // Check for conflicts on each day in the range
                for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, 'day')) {
                    if (hasTimeConflict(d, startTime, endTime)) {
                        toast({
                            title: "Time Conflict",
                            description: `There is a time conflict on ${d.format('MMMM D, YYYY')}. Please adjust your schedule.`,
                            variant: 'destructive'
                        });
                        return;
                    }
                }

                // Create only one event that spans the entire date range
                const newEvent: Event = {
                    id: uuidv4(),
                    title: activityTitle,
                    requestor: requestor,
                    equipments: selectedEquipments,
                    start: moment(`${startDate.format('YYYY-MM-DD')} ${startTime}`).toDate(),
                    end: moment(`${endDate.format('YYYY-MM-DD')} ${endTime}`).toDate(),
                    status: 'pending',
                    remarks: remarks
                };

                const bookingData = eventToBooking(newEvent);
                const createdBooking = await createBooking(bookingData);

                // Update with actual ID from API
                newEvent.id = createdBooking.id?.toString() || newEvent.id;

                // Update local state (add to events and mark dates as clicked)
                setEvents(prevEvents => [...prevEvents, newEvent]);

                // Mark the date range as having events
                const newClickedDates = new Set(clickedDates);
                for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, 'day')) {
                    newClickedDates.add(d.format('YYYY-MM-DD'));
                }
                setClickedDates(newClickedDates);

                toast({
                    title: "Activity added",
                    description: startDate.isSame(endDate, 'day')
                        ? `'${activityTitle}' added on ${startDate.format('MMMM D, YYYY')}`
                        : `'${activityTitle}' added from ${startDate.format('MMM D')} to ${endDate.format('MMM D, YYYY')}`
                });
            }

            // Reset form fields
            setActivityTitle('');
            setRequestor('');
            setRemarks('');
            setSelectedEquipments([]);
            setCustomEquipment('');
            setShowCustomInput(false);
            setIsEditMode(false);
            setEditingEvent(null);
            setIsActivityModalOpen(false);

        } catch (error) {
            console.error('Failed to save booking:', error);
            toast({
                title: 'Error',
                description: 'Failed to save the booking. Please try again.',
                variant: 'destructive'
            });
        }
    };

    // Form Input Handlers
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
        if (e.target.value >= endTime) {
            setTimeError("End time must be after start time");
        } else {
            setTimeError(null);
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndTime(e.target.value);
        if (startTime >= e.target.value) {
            setTimeError("End time must be after start time");
        } else {
            setTimeError(null);
        }
    };

    // Equipment Handlers
    const handleEquipmentSelect = (equipment: string) => {
        if (equipment === "Others") {
            setShowCustomInput(true);
            return;
        }

        // Check if equipment already selected
        const existingIndex = selectedEquipments.findIndex(item => item.name === equipment);

        if (existingIndex === -1) {
            // Add new equipment with quantity 1
            setSelectedEquipments([...selectedEquipments, { name: equipment, quantity: 1 }]);
        }
    };

    const handleRemoveEquipment = (name: string) => {
        setSelectedEquipments(selectedEquipments.filter(item => item.name !== name));
    };

    const handleQuantityChange = (name: string, change: number) => {
        setSelectedEquipments(selectedEquipments.map(item =>
            item.name === name
                ? { ...item, quantity: Math.max(1, item.quantity + change) }
                : item
        ));
    };

    const handleAddCustomEquipment = () => {
        if (!customEquipment.trim()) return;

        setSelectedEquipments([
            ...selectedEquipments,
            { name: customEquipment, quantity: 1, isCustom: true }
        ]);
        setCustomEquipment('');
        setShowCustomInput(false);
    };

    // Utility Functions
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100';
            case 'approved': return 'bg-green-100';
            case 'rejected': return 'bg-red-100';
            default: return 'bg-blue-100';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-orange-700';
            case 'approved': return 'text-green-700';
            case 'rejected': return 'text-red-700';
            default: return 'text-blue-700';
        }
    };

    const getStatusBorderColor = (status: string) => {
        switch (status) {
            case 'pending': return 'border-orange-300';
            case 'approved': return 'border-green-300';
            case 'rejected': return 'border-red-300';
            default: return 'border-blue-300';
        }
    };

    const getFilteredEvents = (status: 'pending' | 'approved' | 'rejected') => {
        return events.filter(event => event.status === status);
    };

    // UI Components
    const CustomDateCell = ({ children, value }: { children: React.ReactNode; value: Date }) => {
        const dateStr = moment(value).format('YYYY-MM-DD');
        const isClicked = clickedDates.has(dateStr);
        const dateEvents = isClicked ? events.filter(event => moment(event.start).format('YYYY-MM-DD') === dateStr) : [];

        // Determine cell color based on event statuses
        let cellClass = '';
        if (dateEvents.length > 0) {
            // Priority: rejected > pending > approved
            if (dateEvents.some(e => e.status === 'rejected')) {
                cellClass = 'bg-red-50';
            } else if (dateEvents.some(e => e.status === 'pending')) {
                cellClass = 'bg-orange-50';
            } else if (dateEvents.some(e => e.status === 'approved')) {
                cellClass = 'bg-green-50';
            }
        }

        return (
            <div className={`rbc-day-bg ${cellClass}`}>
                {children}
            </div>
        );
    };

    const EventComponent = ({ event }: { event: any }) => {
        const statusColorClass = getStatusColor(event.status);
        const statusTextClass = getStatusTextColor(event.status);
        const statusBorderClass = getStatusBorderColor(event.status);

        return (
            <div
                className={`${statusColorClass} ${statusBorderClass} border rounded px-1 py-0.5 overflow-hidden`}
                style={{ fontSize: '10px', lineHeight: '1.2' }}
            >
                <div className={`font-medium truncate ${statusTextClass}`}>{event.title}</div>
                <div className="truncate">{moment(event.start).format('h:mm')}-{moment(event.end).format('h:mm')}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center py-8 px-4 w-full">
            <h2 className="text-2xl font-bold mb-6">Event Calendar</h2>
            <Card className="w-full max-w-6xl shadow-lg">
                <CardHeader className="p-4 pb-0 flex justify-between items-center">
                    <div></div> {/* Empty div to push buttons to the right */}
                    <div className="flex space-x-2">
                        <Button
                            onClick={openAddActivityModal}
                            className="flex items-center"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Activity
                        </Button>
                        <Button
                            onClick={() => setIsAllActivitiesModalOpen(true)}
                            variant="outline"
                            className="flex items-center"
                        >
                            <List className="mr-1 h-4 w-4" />
                            View Activities
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[700px]">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            selectable={false} // Disable selection
                            className="min-h-[700px]"
                            components={{
                                dateCellWrapper: CustomDateCell,
                                event: EventComponent
                            }}
                            eventPropGetter={() => ({
                                style: {
                                    fontSize: '10px',
                                    padding: '0',
                                    margin: '0 1px',
                                }
                            })}
                            views={['month']}
                            defaultView="month"
                            dayLayoutAlgorithm="no-overlap" // Better handling of multiple events
                            onSelectEvent={() => { }} // Disable event selection
                            onSelectSlot={() => { }} // Disable slot selection
                        />
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            This action cannot be undone. This will permanently delete the activity from the calendar.
                        </p>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2 justify-end mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={deleteActivity}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activity Creation/Edit Modal */}
            <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? "Edit Activity" : "Add Activity"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Fill in the details to {isEditMode ? "update" : "schedule"} an activity
                        </p>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Activity Details Section */}

                        <div className="space-y-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="start-date" className="text-right font-medium">
                                    Start Date
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={selectedStartDate ? moment(selectedStartDate).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => {
                                            const newDate = new Date(e.target.value);
                                            setSelectedStartDate(newDate);
                                            // If end date is before start date, update end date too
                                            if (selectedEndDate && newDate > selectedEndDate) {
                                                setSelectedEndDate(newDate);
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="end-date" className="text-right font-medium">
                                    End Date
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={selectedEndDate ? moment(selectedEndDate).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => setSelectedEndDate(new Date(e.target.value))}
                                        min={selectedStartDate ? moment(selectedStartDate).format('YYYY-MM-DD') : ''}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="activity-title" className="text-right font-medium">
                                    Activity Title
                                </Label>
                                <Input
                                    id="activity-title"
                                    value={activityTitle}
                                    onChange={(e) => setActivityTitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Enter activity title"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="requestor" className="text-right font-medium">
                                    Name of Requestor
                                </Label>
                                <Input
                                    id="requestor"
                                    value={requestor}
                                    onChange={(e) => setRequestor(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Enter requestor name"
                                />
                            </div>
                        </div>

                        {/* Time Selection Section */}
                        <div className="pt-2">
                            <div className="col-span-4">
                                <Separator />
                                <div className="text-sm font-medium my-3 flex items-center">
                                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Time Schedule</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label className="text-right font-medium">
                                    Start Time
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={startTime}
                                        onChange={handleStartTimeChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label className="text-right font-medium">
                                    End Time
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={endTime}
                                        onChange={handleEndTimeChange}
                                    />
                                </div>
                            </div>

                            {/* Time conflict error display */}
                            {timeError && (
                                <div className="mt-2 text-red-500 text-sm text-center">
                                    {timeError}
                                </div>
                            )}
                        </div>

                        {/* Status Selection - Only visible to admins */}
                        {isAdmin && (
                            <div className="pt-2">
                                <div className="col-span-4">
                                    <Separator />
                                    <div className="text-sm font-medium my-3 flex items-center">
                                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                                        <span>Admin Controls</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right font-medium">
                                        Activity Status
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={(value: 'pending' | 'approved' | 'rejected') => setStatus(value)}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Status display for regular users */}
                        {!isAdmin && isEditMode && (
                            <div className="pt-2">
                                <div className="col-span-4">
                                    <Separator />
                                    <div className="text-sm font-medium my-3">Current Status</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right font-medium">
                                        Status
                                    </Label>
                                    <div className="col-span-3">
                                        <Badge
                                            variant={status === 'pending' ? 'outline' :
                                                status === 'approved' ? 'default' : 'destructive'}
                                            className={status === 'pending' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' : ''}
                                        >
                                            {status === 'pending' ? 'Pending Review' :
                                                status === 'approved' ? 'Approved' : 'Rejected'}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {status === 'pending' ?
                                                'Your activity is awaiting review by an administrator.' :
                                                status === 'approved' ?
                                                    'This activity has been approved.' :
                                                    'This activity has been rejected.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Equipment Section */}
                        <div className="pt-2">
                            <div className="col-span-4">
                                <Separator />
                                <div className="text-sm font-medium my-3 flex items-center">
                                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Equipment Needed</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2 font-medium">
                                    Add Equipment
                                </Label>
                                <div className="col-span-3 space-y-3">
                                    <Select onValueChange={handleEquipmentSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PREDEFINED_EQUIPMENT.map(option => (
                                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Selected equipment chips */}
                                    {selectedEquipments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 pt-1">
                                            {selectedEquipments.map((item) => (
                                                <Badge key={item.name} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="mx-1 flex items-center space-x-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => handleQuantityChange(item.name, -1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-4 text-center">{item.quantity}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => handleQuantityChange(item.name, 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 ml-1"
                                                        onClick={() => handleRemoveEquipment(item.name)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Custom equipment input */}
                                    {showCustomInput && (
                                        <div className="flex space-x-2 mt-3">
                                            <Input
                                                value={customEquipment}
                                                onChange={(e) => setCustomEquipment(e.target.value)}
                                                placeholder="Enter custom equipment"
                                                className="flex-grow"
                                            />
                                            <Button type="button" size="sm" onClick={handleAddCustomEquipment}>
                                                Add
                                            </Button>
                                        </div>
                                    )}

                                    {!selectedEquipments.length && !showCustomInput && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select equipment from the dropdown or choose "Others" to add custom items.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Remarks Section */}
                        <div className="pt-2">
                            <div className="col-span-4">
                                <Separator />
                                <div className="text-sm font-medium my-3 flex items-center">
                                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Additional Remarks</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="remarks" className="text-right mt-2 font-medium">
                                    Remarks
                                </Label>
                                <div className="col-span-3">
                                    <textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full min-h-[80px] p-2 border rounded-md"
                                        placeholder="Add any additional information or special requirements here"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsActivityModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleAddActivity}>
                            {isEditMode ? "Update Activity" : "Add Activity"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* All Activities Modal with Tabs */}
            <Dialog
                open={isAllActivitiesModalOpen}
                onOpenChange={setIsAllActivitiesModalOpen}
            >
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>All Activities</DialogTitle>
                    </DialogHeader>

                    <Tabs
                        defaultValue="pending"
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as 'pending' | 'approved' | 'rejected')}
                        className="flex-1 flex flex-col"
                    >
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="pending" className="flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                                Pending
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                                Approved
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                                Rejected
                            </TabsTrigger>
                        </TabsList>

                        <div className="overflow-y-auto flex-1 pr-2" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                            <TabsContent value="pending" className="mt-0">
                                {getFilteredEvents('pending').length > 0 ? (
                                    <div className="space-y-3">
                                        {getFilteredEvents('pending').map((event) => (
                                            <div key={event.id} className="bg-orange-50 border border-orange-200 p-4 rounded-md">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-lg">{event.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {/* Display date range if start and end dates are different */}
                                                            {moment(event.start).format('YYYY-MM-DD') !== moment(event.end).format('YYYY-MM-DD')
                                                                ? `${moment(event.start).format('MMM D, YYYY')} to ${moment(event.end).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                                : `${moment(event.start).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                            }
                                                        </p>
                                                        <p className="text-sm mt-1">Requestor: {event.requestor}</p>
                                                        {event.equipments.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Equipment:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {event.equipments.map((eq) => (
                                                                        <Badge key={eq.name} variant="outline" className="text-xs">
                                                                            {eq.name} ({eq.quantity})
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {event.remarks && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                                                                <p className="text-sm text-gray-600 italic">{event.remarks}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEditActivity(event)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeleteConfirm(event.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-6">No pending activities</p>
                                )}
                            </TabsContent>

                            <TabsContent value="approved" className="mt-0">
                                {getFilteredEvents('approved').length > 0 ? (
                                    <div className="space-y-3">
                                        {getFilteredEvents('approved').map((event) => (
                                            <div key={event.id} className="bg-green-50 border border-green-200 p-4 rounded-md">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-lg">{event.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {/* Display date range if start and end dates are different */}
                                                            {moment(event.start).format('YYYY-MM-DD') !== moment(event.end).format('YYYY-MM-DD')
                                                                ? `${moment(event.start).format('MMM D, YYYY')} to ${moment(event.end).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                                : `${moment(event.start).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                            }
                                                        </p>
                                                        <p className="text-sm mt-1">Requestor: {event.requestor}</p>
                                                        {event.equipments.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Equipment:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {event.equipments.map((eq) => (
                                                                        <Badge key={eq.name} variant="outline" className="text-xs">
                                                                            {eq.name} ({eq.quantity})
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {event.remarks && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                                                                <p className="text-sm text-gray-600 italic">{event.remarks}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEditActivity(event)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeleteConfirm(event.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-6">No approved activities</p>
                                )}
                            </TabsContent>

                            <TabsContent value="rejected" className="mt-0">
                                {getFilteredEvents('rejected').length > 0 ? (
                                    <div className="space-y-3">
                                        {getFilteredEvents('rejected').map((event) => (
                                            <div key={event.id} className="bg-red-50 border border-red-200 p-4 rounded-md">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-lg">{event.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {/* Display date range if start and end dates are different */}
                                                            {moment(event.start).format('YYYY-MM-DD') !== moment(event.end).format('YYYY-MM-DD')
                                                                ? `${moment(event.start).format('MMM D, YYYY')} to ${moment(event.end).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                                : `${moment(event.start).format('MMM D, YYYY')} • ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`
                                                            }
                                                        </p>
                                                        <p className="text-sm mt-1">Requestor: {event.requestor}</p>
                                                        {event.equipments.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Equipment:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {event.equipments.map((eq) => (
                                                                        <Badge key={eq.name} variant="outline" className="text-xs">
                                                                            {eq.name} ({eq.quantity})
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {event.remarks && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                                                                <p className="text-sm text-gray-600 italic">{event.remarks}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEditActivity(event)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeleteConfirm(event.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-6">No rejected activities</p>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setIsAllActivitiesModalOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HomeMainContainer;