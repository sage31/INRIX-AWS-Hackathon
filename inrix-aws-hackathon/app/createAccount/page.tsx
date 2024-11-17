'use client';
import Link from "next/link";
import { FormEvent } from "react";

export default function createAccount() {
  // When the signup button is pressed, call the login API
  // and redirect to the home page
  const handleSignUp = async () => {
    const response = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({
        name: (document.getElementById("name") as HTMLInputElement).value,
        email: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement)
          .value,
        userPhoto: await getB64Image(
          document.getElementById("photo") as HTMLInputElement
        ),
      }),
    });
    console.log(await response.json());
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold">Create Account</h1>
        </header>
      </div>
      <div className="sign-up-box flex items-center justify-center p-8 w-full max-w-sm">
        <form encType="multipart/form-data" className="flex flex-col gap-4 w-full" action="/api/user" method="POST">
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

          <label
            htmlFor="password"
            className="text-sm font-medium text-red-900"
          >
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
          <button type="submit" className="sign-up-box-button">
            Sign up!
          </button>
        </form>
      </div>
    </div>
  );
}

async function onSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  try {
    const formData = new FormData(event.currentTarget);
    console.log("FORM DATA " + JSON.stringify(formData));
    const response = await fetch("/api/user", {
      method: "POST",
      body: formData
    });

    // Handle response if necessary
    const data = await response.json();
    console.log("DATA " + data);
    // ...
  } catch (error) {
    // Handle error if necessary
    console.error(error);
  }
}

function getB64Image(fileInput: HTMLInputElement) {
  const file = fileInput.files ? fileInput.files[0] : null; // Get the first file selected
  return new Promise<string>((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        // The result contains the Base64 string
        const base64String = (reader.result as string).split(",")[1]; // Strip off the data URL prefix if needed
        resolve(base64String);
      };
      reader.onerror = function (error) {
        reject("Error reading file");
        console.error("Error reading file:", error);
      };

      reader.readAsDataURL(file as File); // Read the file as a Data URL (includes Base64)
    } else {
      reject("No file selected");
      console.log("No file selected");
    }
  });
}