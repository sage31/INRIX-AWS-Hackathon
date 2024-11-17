import Link from 'next/link'

export default function CreateEvent() {
   return (
     <div className="flex flex-col items-center">
       <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
         <header className="create-event-header mb-8 text-center">
           <h1 className="text-4xl font-bold">[Club Name]</h1>
           <h2 className="text-2xl font-medium">Create Event</h2>
         </header>
       </div>
       <div className="create-event-box flex items-center justify-center p-8 w-full max-w-lg mt-8">
         <form className="flex flex-col gap-6 w-full">
           <label htmlFor="eventTitle" className="text-sm font-medium text-red-900">
             Event Title
           </label>
           <input
             type="text"
             id="eventTitle"
             name="eventTitle"
             placeholder="Enter the title of your event"
             required
             className="create-event-box-input"
           />
 
           <label htmlFor="eventDescription" className="text-sm font-medium text-red-900">
             Description
           </label>
           <textarea
             id="eventDescription"
             name="eventDescription"
             placeholder="Enter a description for the event"
             required
             className="create-event-box-input h-24 resize-none"
           ></textarea>
 
           <label htmlFor="eventDate" className="text-sm font-medium text-red-900">
             Date
           </label>
           <input
             type="date"
             id="eventDate"
             name="eventDate"
             required
             className="create-event-box-input"
           />
 
           <label htmlFor="eventLocation" className="text-sm font-medium text-red-900">
             Location
           </label>
           <input
             type="text"
             id="eventLocation"
             name="eventLocation"
             placeholder="Enter the location"
             required
             className="create-event-box-input"
           />
 
           <label htmlFor="coverPhoto" className="text-sm font-medium text-red-900">
             Upload a Cover Photo
           </label>
           <input
             type="file"
             id="coverPhoto"
             name="coverPhoto"
             accept="image/*"
             required
             className="create-event-box-input"
           />
           <Link href="/event">
           <button type="submit" className="create-event-box-button">
             Create Event
           </button>
           </Link>
         </form>
       </div>
     </div>
   );
 }
