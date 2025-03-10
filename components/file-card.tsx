"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteFile, updateFileVisibility } from "@/lib/appwrite-config"
import { useToast } from "@/components/ui/use-toast"
import { Download, Trash2, Share2, Eye, EyeOff } from "lucide-react"
import { ShareDialog } from "./share-dialog"
import { formatFileSize, getFileIcon } from "@/lib/utils"

interface FileCardProps {
  file: any
  onDelete?: () => void
  isShared?: boolean
}

export function FileCard({ file, onDelete, isShared = false }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(file.is_public)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteFile(file.file_id, file.$id)
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      })
      if (onDelete) onDelete()
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleVisibility = async () => {
    try {
      await updateFileVisibility(file.$id, !isPublic)
      setIsPublic(!isPublic)
      toast({
        title: `File is now ${!isPublic ? "public" : "private"}`,
        description: `Anyone with the link can ${!isPublic ? "now" : "no longer"} access this file.`,
      })
    } catch (error) {
      console.error("Error updating file visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update file visibility. Please try again.",
        variant: "destructive",
      })
    }
  }

  const FileTypeIcon = getFileIcon(file.type)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileTypeIcon className="h-5 w-5 text-primary" />
          <span className="truncate">{file.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
          <p>Size: {formatFileSize(file.size)}</p>
          <p>Uploaded: {new Date(file.created_at).toLocaleDateString()}</p>
          {isShared && <p className="text-primary">Shared with you</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>

          {!isShared && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>

              <Button variant="outline" size="sm" onClick={handleToggleVisibility}>
                {isPublic ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Make Private
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Make Public
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {!isShared && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>

      <ShareDialog
        fileId={file.$id}
        fileName={file.name}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </Card>
  )
}

