"use client"

import { useState, useEffect } from "react"
import { type User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import type { User } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

            if (userDoc.exists()) {
              setUser(userDoc.data() as User)
            } else {
              // Create new user document
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Unknown User",
                email: firebaseUser.email || "",
                role: "developer", // Default role, can be changed later
              }

              await setDoc(doc(db, "users", firebaseUser.uid), newUser)
              setUser(newUser)
            }
          } else {
            setUser(null)
          }
          setError(null)
        } catch (authError) {
          console.error("[v0] Auth state change error:", authError)
          setError("Failed to authenticate. Please check your Firebase configuration.")
        } finally {
          setLoading(false)
        }
      })

      return () => unsubscribe()
    } catch (initError) {
      console.error("[v0] Firebase initialization error:", initError)
      setError("Firebase configuration error. Please check your environment variables.")
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      console.error("[v0] Error signing in with Google:", error)

      if (error.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname
        setError(
          `Domain "${currentDomain}" is not authorized for Google sign-in. Please add this domain to your Firebase console under Authentication > Settings > Authorized domains.`,
        )
      } else if (error.code === "auth/popup-blocked") {
        setError("Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.")
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.")
      } else {
        setError(`Failed to sign in with Google: ${error.message}`)
      }
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (error) {
      console.error("[v0] Error signing out:", error)
      setError("Failed to sign out. Please try again.")
    }
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  }
}
