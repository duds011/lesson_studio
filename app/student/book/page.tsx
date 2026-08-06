import { redirect } from 'next/navigation'

// Booking was removed from the student portal — lessons are arranged with the
// teacher directly. The route stays so old links land somewhere sensible.
export default function StudentBookPage() {
  redirect('/student/dashboard')
}
