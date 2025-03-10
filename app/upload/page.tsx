"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { uploadFile } from "@/lib/appwrite-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, File } from "lucide-react"

export default function UploadPage() {
  const { user, isLoading } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push("/login")
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    try {
      setIsUploading(true)
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      await uploadFile(file, user.$id)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      })

      // Reset form and redirect after a short delay
      setTimeout(() => {
        setFile(null)
        setUploadProgress(0)
        router.push("/")
      }, 1000)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Upload a file to your XXI Storage account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <File className="h-10 w-10 text-primary mb-2" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium">Click to select a file</p>
                  <p className="text-sm text-muted-foreground mt-1">or drag and drop here</p>
                </div>
              )}
              <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground text-right">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

