"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { toast } from "sonner";

interface DateTimeRangePickerProps {
  className?: string;
  onRangeChange?: (range: {
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
  }) => void;
}

export function DateTimeRangePicker({
  className,
  onRangeChange,
}: DateTimeRangePickerProps) {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [showStartTime, setShowStartTime] = React.useState(false);
  const [showEndTime, setShowEndTime] = React.useState(false);
  const [startTime, setStartTime] = React.useState<string>();
  const [endTime, setEndTime] = React.useState<string>();

  const [startPopoverOpen, setStartPopoverOpen] = React.useState(false);
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(
    startDate
  );
  const [endPopoverOpen, setEndPopoverOpen] = React.useState(false);
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(
    startDate
  );

  // Generate time options in 30-minute intervals
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const time = `${formattedHour}:${formattedMinute}`;
        const label = format(new Date().setHours(hour, minute), "h:mm a");
        options.push({ value: time, label });
      }
    }
    return options;
  }, []);

  // Update parent component when selection changes
  React.useEffect(() => {
    if (startDate && endDate && onRangeChange) {
      onRangeChange({
        startDate,
        endDate,
        startTime: showStartTime ? startTime : undefined,
        endTime: showEndTime ? endTime : undefined,
      });
    }
  }, [
    startDate,
    endDate,
    startTime,
    endTime,
    showStartTime,
    showEndTime,
    onRangeChange,
  ]);

  // Validate that end date is after start date
  React.useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // React.useEffect(() => {
  //   if (endDate && isToday(endDate)) {
  //     setEndTime(undefined);
  //   }
  // }, [endDate]);

  const isToday = (date?: Date) => {
    if (!date) return false;
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const filteredTimeOptions = React.useMemo(() => {
    if (!startDate || !isToday(startDate)) return timeOptions;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return timeOptions.filter((option) => {
      const [hour, minute] = option.value.split(":").map(Number);
      const optionMinutes = hour * 60 + minute;
      return optionMinutes >= currentMinutes;
    });
  }, [timeOptions, startDate]);

  const filteredEndTimeOptions = React.useMemo(() => {
    if (!endDate) return timeOptions;

    // Если endDate == today И startDate == today
    if (isToday(startDate) && isToday(endDate)) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      return timeOptions.filter((option) => {
        const [hour, minute] = option.value.split(":").map(Number);
        const optionMinutes = hour * 60 + minute;
        return optionMinutes >= currentMinutes;
      });
    }

    // Если другая дата — показываем всё
    return timeOptions;
  }, [timeOptions, endDate, startDate]);

  const handleConfirm = () => {
    toast.success("🎉 You have scheduled an event!");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <div className="flex flex-col gap-2 p-3">
                <Calendar
                  mode="single"
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempStartDate(startDate);
                      setStartPopoverOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (tempStartDate) setStartDate(tempStartDate);
                      setStartPopoverOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Start Time Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 pt-2 cursor-default">
                    <Switch
                      id="start-time-toggle"
                      checked={showStartTime}
                      onCheckedChange={setShowStartTime}
                      disabled={!startDate}
                      className="disabled:cursor-default"
                    />
                    <Label
                      htmlFor="start-time-toggle"
                      className="cursor-pointer"
                    >
                      Add start time
                    </Label>
                  </div>
                </TooltipTrigger>

                {!startDate && (
                  <TooltipContent>First choose a start date</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Start Time Selector (conditional) */}
          {showStartTime && (
            <div className="pt-2">
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time">
                    {startTime ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {
                          timeOptions.find(
                            (option) => option.value === startTime
                          )?.label
                        }
                      </div>
                    ) : (
                      "Select time"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                disabled={!startDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <div className="flex flex-col gap-2 p-3">
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempEndDate(endDate);
                      setEndPopoverOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (tempEndDate) setEndDate(tempEndDate);
                      setEndPopoverOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* End Time Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 pt-2 cursor-default">
                    <Switch
                      id="start-time-toggle"
                      checked={showEndTime}
                      onCheckedChange={setShowEndTime}
                      disabled={!endDate}
                      className="disabled:cursor-default"
                    />
                    <Label
                      htmlFor="start-time-toggle"
                      className="cursor-pointer"
                    >
                      Add end time
                    </Label>
                  </div>
                </TooltipTrigger>

                {!startDate && (
                  <TooltipContent>First choose a start date</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* End Time Selector (conditional) */}
          {showEndTime && (
            <div className="pt-2">
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time">
                    {endTime ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {
                          timeOptions.find((option) => option.value === endTime)
                            ?.label
                        }
                      </div>
                    ) : (
                      "Select time"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredEndTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Summary of selection */}
      {startDate && endDate && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm shadow-md">
          <p className="font-semibold text-blue-800">Selected Range:</p>
          <p className="text-blue-700">
            {format(startDate, "PPP")}
            {showStartTime &&
              startTime &&
              ` at ${
                timeOptions.find((option) => option.value === startTime)?.label
              }`}
            {" to "}
            {format(endDate, "PPP")}
            {showEndTime &&
              endTime &&
              ` at ${
                timeOptions.find((option) => option.value === endTime)?.label
              }`}
          </p>
        </div>
      )}

      <div className="pt-8 flex justify-center">
        <Button
          onClick={handleConfirm}
          disabled={!startDate || !endDate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </Button>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm shadow-md">
        <p className="text-yellow-800 font-semibold">Tip:</p>
        <p className="text-yellow-700">
          Make sure your selected time fits your event schedule!
        </p>
      </div>
    </div>
  );
}
