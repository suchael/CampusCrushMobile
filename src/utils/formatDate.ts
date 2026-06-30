/**
 * Formats database timestamps into a clean, contextual chat feed string:
 * - Today: "1:43 AM"
 * - Yesterday: "Yesterday"
 * - Older: "31/05/2026"
 */
export function formatConversationTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // Failsafe check for invalid dates
  if (isNaN(date.getTime())) return "";

  const now = new Date();

  // Reset time fragments to compute absolute date offsets safely
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const targetTime = date.getTime();

  // 1. Check if timestamp falls within the current day bounds
  if (targetTime >= todayStart.getTime()) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight edge case (0 hours)
    return `${hours}:${minutes} ${ampm}`;
  }

  // 2. Check if timestamp falls within yesterday bounds
  if (targetTime >= yesterdayStart.getTime()) {
    return "Yesterday";
  }

  // 3. Fallback to strict standard DD/MM/YYYY numerical mapping
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}



export const formatRelativeTime = (dateString: string) => {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
};



// FORMAT: Fri, Jun 12th - 10:30PM
export const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // If the date string is unparseable, return the original string immediately
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const weekday = weekdays[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();

    // 1. Calculate the ordinal suffix (st, nd, rd, th)
    let suffix = "th";
    if (day < 11 || day > 13) {
      switch (day % 10) {
        case 1: suffix = "st"; break;
        case 2: suffix = "nd"; break;
        case 3: suffix = "rd"; break;
      }
    }

    // 2. Format Time elements into 12-hour format
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert '0' hours to '12'

    // 3. Assemble final string matching "Fri, Jun 12th - 10:30 PM"
    return `${weekday}, ${month} ${day}${suffix} - ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    // Fallback block returns original input if anything goes wrong
    return dateString;
  }
};

