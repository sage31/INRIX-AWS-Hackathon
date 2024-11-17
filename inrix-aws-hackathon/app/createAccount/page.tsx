import Link from 'next/link'

export default function createAccount() {
   return(
      <div className="flex flex-col items-center">
         <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
         <header className="mb-4 text-center">
         <h1 className="text-4xl font-bold">Create Account</h1>
         </header>
         </div>
         <div className="sign-up-box flex items-center justify-center p-8 w-full max-w-sm">
           <form className="flex flex-col gap-4 w-full">
             <label htmlFor="email" className="text-sm font-medium text-red-900">
               Email
             </label>
             <input
               type="email"
               id="email"
               name="email"
               placeholder="Enter your email"
               required
               className="login_box-input text-red-900"
             />
 
             <label htmlFor="password" className="text-sm font-medium text-red-900">
               Password
             </label>
             <input
               type="password"
               id="password"
               name="password"
               placeholder="Enter your password"
               required
               className="login_box-input text-red-900"
             />

            <label htmlFor="name" className="text-sm font-medium text-red-900">
               First and Last name
             </label>
             <input
               type="name"
               id="name"
               name="name"
               placeholder="Enter your name"
               required
               className="login_box-input text-red-900"
             />

            <label htmlFor="photo" className="text-sm font-medium text-red-900">
               Upload a clear photo of you!
            </label>
            <input
               type="file"
               id="photo"
               name="photo"
               accept="image/*"
               required
               placeholder="Choose File"
               className="text-red-900"
             />
            <Link href="/">
            <button
               type="submit"
               className="sign-up-box-button"
            >
            Sign up!
            </button>
            </Link>
            </form>
         </div>
      </div>
   );
}