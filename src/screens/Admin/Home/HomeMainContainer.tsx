import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
// Removed AlertDialog imports

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

interface Equipment {
    name: string;
    quantity: number;
    isCustom?: boolean;
}

interface Event {
    id: string;
    title: string;
    requestor: string; // New field
    equipments: Equipment[]; // New field
    start: Date;
    end: Date;
}
const HomeMainContainer = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [clickedDates, setClickedDates] = useState<Set<string>>(new Set());

    // States for the two dialogs
    const [isDateInfoOpen, setIsDateInfoOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activityTitle, setActivityTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [timeError, setTimeError] = useState<string | null>(null);

    const [requestor, setRequestor] = useState('');
    const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);
    const [customEquipment, setCustomEquipment] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    // Predefined equipment options
    const equipmentOptions = [
        "Projector",
        "Laptop",
        "Microphone",
        "Speakers",
        "Whiteboard",
        "Extension Cord",
        "Others"
    ];

    // Handle date click event - shows date info dialog
    const handleDateClick = (slotInfo: any) => {
        console.log('Date clicked:', slotInfo.start);
        setSelectedDate(slotInfo.start);
        setIsDateInfoOpen(true);
    };

    const handleEditActivity = (event: Event) => {
        setIsEditMode(true);
        setEditingEvent(event);
        setIsDateInfoOpen(false);
        setIsActivityModalOpen(true);
        setTimeError(null);

        // Fill form with existing activity data
        setActivityTitle(event.title);
        setRequestor(event.requestor);
        setStartTime(moment(event.start).format('HH:mm'));
        setEndTime(moment(event.end).format('HH:mm'));
        setSelectedEquipments([...event.equipments]);
    };

    // Handle delete confirmation dialog
    const handleDeleteConfirm = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteConfirmOpen(true);
    };

    // Delete an activity
    const deleteActivity = () => {
        if (!eventToDelete) return;

        // First update the events array
        setEvents(events.filter(event => event.id !== eventToDelete));

        // Reset delete-related state
        setEventToDelete(null);

        // Force removal of any lingering overlays by adding a small delay
        setTimeout(() => {
            document.body.classList.remove('overflow-hidden');
            setDeleteConfirmOpen(false);
            setIsDateInfoOpen(false);
            setIsActivityModalOpen(false);
        }, 0);

        toast({
            title: "Activity deleted",
            description: "The activity has been removed from the calendar",
        });

        // Update clicked dates if needed (if no more events on that date)
        if (selectedDate) {
            const dateStr = moment(selectedDate).format('YYYY-MM-DD');
            const eventsOnDate = events.filter(event => {
                return moment(event.start).format('YYYY-MM-DD') === dateStr && event.id !== eventToDelete;
            });

            if (eventsOnDate.length === 0) {
                const newClickedDates = new Set(clickedDates);
                newClickedDates.delete(dateStr);
                setClickedDates(newClickedDates);
            }
        }
    };

    // Open activity creation dialog from date info dialog
    const openActivityDialog = () => {
        setIsDateInfoOpen(false);
        setIsActivityModalOpen(true);
        setTimeError(null); // Reset any previous error

        // Reset form fields
        setActivityTitle('');
        setStartTime('09:00');
        setEndTime('10:00');
    };
    const { toast } = useToast()

    // Check for time conflicts
    const hasTimeConflict = (newStart: moment.Moment, newEnd: moment.Moment): boolean => {
        if (!selectedDate) return false;

        const dateStr = moment(selectedDate).format('YYYY-MM-DD');
        const dateEvents = events.filter(event => moment(event.start).format('YYYY-MM-DD') === dateStr);

        return dateEvents.some(event => {
            const existingStart = moment(event.start);
            const existingEnd = moment(event.end);

            // Check if times are exactly the same
            if (newStart.format('HH:mm') === existingStart.format('HH:mm') &&
                newEnd.format('HH:mm') === existingEnd.format('HH:mm')) {
                return true;
            }

            // Check if the new event overlaps with any existing event
            return (
                (newStart.isSameOrAfter(existingStart) && newStart.isBefore(existingEnd)) ||
                (newEnd.isAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) ||
                (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd))
            );
        });
    };

    // Validate time inputs
    const validateTimeInputs = (): boolean => {
        // Check if end time is after start time
        if (startTime >= endTime) {
            setTimeError("End time must be after start time");
            return false;
        }

        // Create moment objects for the new event times
        const startDateTime = moment(selectedDate).format('YYYY-MM-DD');
        const startDateWithTime = moment(`${startDateTime} ${startTime}`);
        const endDateWithTime = moment(`${startDateTime} ${endTime}`);

        // Check for conflicts with existing events
        if (hasTimeConflict(startDateWithTime, endDateWithTime)) {
            setTimeError("This time conflicts with an existing activity");
            return false;
        }

        setTimeError(null);
        return true;
    };

    // Handle activity submission and mark date as clicked only after submission
    const handleAddActivity = () => {
        if (!selectedDate || !activityTitle.trim() || !requestor.trim()) {
            setTimeError("Please fill in all required fields");
            return;
        }

        // Validate time inputs before proceeding
        if (!validateTimeInputs()) return;

        // Create start date with selected time
        const startDateTime = moment(selectedDate).format('YYYY-MM-DD');
        const startDateWithTime = moment(`${startDateTime} ${startTime}`);

        // Create end date with selected time
        const endDateTime = moment(selectedDate).format('YYYY-MM-DD');
        const endDateWithTime = moment(`${endDateTime} ${endTime}`);

        if (isEditMode && editingEvent) {
            // Update existing event
            const updatedEvents = events.map(event => {
                if (event.id === editingEvent.id) {
                    return {
                        ...event,
                        title: activityTitle,
                        requestor: requestor,
                        equipments: selectedEquipments,
                        start: startDateWithTime.toDate(),
                        end: endDateWithTime.toDate(),
                    };
                }
                return event;
            });

            setEvents(updatedEvents);

            toast({
                title: "Activity updated",
                description: `'${activityTitle}' has been updated`,
            });
        } else {
            // Create new event
            const newEvent: Event = {
                id: uuidv4(),
                title: activityTitle,
                requestor: requestor,
                equipments: selectedEquipments,
                start: startDateWithTime.toDate(),
                end: endDateWithTime.toDate(),
            };

            setEvents([...events, newEvent]);

            // Mark date as clicked since activity was added
            const dateStr = moment(selectedDate).format('YYYY-MM-DD');
            const newClickedDates = new Set(clickedDates);

            if (!newClickedDates.has(dateStr)) {
                newClickedDates.add(dateStr);
                setClickedDates(newClickedDates);
            }

            toast({
                title: "Activity added",
                description: `'${activityTitle}' added to ${moment(selectedDate).format('MMMM D, YYYY')}`,
            });
        }

        // Reset form fields
        setActivityTitle('');
        setRequestor('');
        setSelectedEquipments([]);
        setCustomEquipment('');
        setShowCustomInput(false);
        setIsEditMode(false);
        setEditingEvent(null);
        setIsActivityModalOpen(false);
    };

    // Time input change handlers with validation
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
        // Optionally validate when input changes
        if (e.target.value >= endTime) {
            setTimeError("End time must be after start time");
        } else {
            setTimeError(null);
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndTime(e.target.value);
        // Optionally validate when input changes
        if (startTime >= e.target.value) {
            setTimeError("End time must be after start time");
        } else {
            setTimeError(null);
        }
    };

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

    // Add the dialog cleanup utility function here
    const closeAllDialogs = () => {
        setIsDateInfoOpen(false);
        setIsActivityModalOpen(false);
        setDeleteConfirmOpen(false);
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date | null) => {
        if (!date) return [];
        const dateStr = moment(date).format('YYYY-MM-DD');
        return events.filter(event => moment(event.start).format('YYYY-MM-DD') === dateStr);
    };

    // CustomDateCell component to customize date cells in the calendar
    const CustomDateCell = ({ children, value }: { children: React.ReactNode; value: Date }) => {
        const dateStr = moment(value).format('YYYY-MM-DD');
        const isClicked = clickedDates.has(dateStr);

        return (
            <div className={`rbc-day-bg ${isClicked ? 'bg-blue-100' : ''}`}>
                {children}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center py-8 px-4 w-full">
            <h2 className="text-2xl font-bold mb-6">Event Calendar</h2>
            <Card className="w-full max-w-6xl shadow-lg">
                <CardContent className="p-6">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectSlot={handleDateClick}
                        selectable={true}
                        className="min-h-[700px]"
                        components={{
                            dateCellWrapper: CustomDateCell
                        }}
                    />
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog - Replaced AlertDialog with Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // First clean up body classes
                        document.body.classList.remove('overflow-hidden');
                        // Then update state
                        setDeleteConfirmOpen(false);
                    } else {
                        setDeleteConfirmOpen(open);
                    }
                }}
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

            {/* Date Information Dialog */}
            <Dialog
                open={isDateInfoOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Clean up body classes
                        document.body.classList.remove('overflow-hidden');
                        // Then update state
                        setIsDateInfoOpen(false);
                    } else {
                        setIsDateInfoOpen(open);
                    }
                }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDate ? moment(selectedDate).format('MMMM D, YYYY') : 'Date Info'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="text-md font-semibold mb-2">Activities for this date:</h3>
                        {getEventsForDate(selectedDate).length > 0 ? (
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                {getEventsForDate(selectedDate).map((event) => (
                                    <div key={event.id} className="p-3 bg-blue-50 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{event.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditActivity(event)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteConfirm(event.id)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                                        <path d="M3 6h18"></path>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No activities for this date.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDateInfoOpen(false)}>
                            Close
                        </Button>
                        <Button type="button" onClick={openActivityDialog}>
                            Add Activity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activity Creation Modal with added fields */}
            <Dialog open={isActivityModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // Clean up body classes
                        document.body.classList.remove('overflow-hidden');
                        // Then update state
                        setIsActivityModalOpen(false);
                    } else {
                        setIsActivityModalOpen(open);
                    }
                }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Activity" : "Add Activity"} for {selectedDate ? moment(selectedDate).format('MMMM D, YYYY') : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="activity-title" className="text-right">
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
                            <Label htmlFor="requestor" className="text-right">
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

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-time" className="text-right">
                                Start Time
                            </Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-time" className="text-right">
                                End Time
                            </Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                className="col-span-3"
                            />
                        </div>

                        {/* Equipment Selection */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">
                                Equipment
                            </Label>
                            <div className="col-span-3 space-y-3">
                                <Select onValueChange={handleEquipmentSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select equipment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipmentOptions.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Selected equipment chips */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedEquipments.map((item) => (
                                        <Badge key={item.name} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                                            <span>{item.name}</span>
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
                                                <span>{item.quantity}</span>
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

                                {/* Custom equipment input */}
                                {showCustomInput && (
                                    <div className="flex space-x-2">
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
                            </div>
                        </div>

                        {/* Display time conflict error */}
                        {timeError && (
                            <div className="col-span-4 text-red-500 text-sm pl-4">
                                {timeError}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsActivityModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleAddActivity}>
                            {isEditMode ? "Update Activity" : "Add Activity"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HomeMainContainer;