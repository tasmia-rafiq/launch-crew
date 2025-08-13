import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

  if (diff < 60) {
    return `${diff}s ago`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}hr ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }); // e.g., Jul 31, 2025
  }
}

export function parseServerActionResponse<T>(response: T) {
  return JSON.parse(JSON.stringify(response));
}

export function linkifyMentions(html: string) {
  return html.replace(/@([\w\d_-]+)/g, (match, username) => {
    return `<a href="/user/${username}" class="text-blue-600 hover:underline">@${username}</a>`;
  });
}