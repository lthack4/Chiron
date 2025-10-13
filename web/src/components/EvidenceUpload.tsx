import { useState } from 'react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, runTransaction, arrayUnion } from 'firebase/firestore'
import { db, storage, isFirebaseConfigured } from '../firebase'
import { getCurrentUserID } from '../context/AuthRoute'

export function EvidenceUploader({ businessId, controlId, disabled }: { businessId: string | null; controlId?: string | null; disabled?: boolean }) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null)
        const files = e.target.files
        if (!files || files.length === 0) return
        if (!businessId) {
            setError('No company selected')
            return
        }
        if (!isFirebaseConfigured || !db || !storage) {
            setError('Firebase not configured')
            return
        }

        const file = files[0]
        const user_id = getCurrentUserID()
        console.log(user_id)
        if (!user_id) {
            setError('You must be signed in to upload files')
            return
        }
        const timestamp = Date.now()
        // Storage rule expects: /evidence/{controlId}/{uid}/{fileName}
        const effectiveControlId = controlId ?? businessId ?? 'unknown'         // might change controlId to businessId, not sure yet
    const path = `evidence/${effectiveControlId}/${user_id}/${file.name}`
        const ref = storageRef(storage!, path)

        console.log('Uploading to', path)

        try {
            setUploading(true)
            setProgress(0)
            
            const uploadTask = uploadBytesResumable(ref, file)

            await new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed', (snapshot) => {
                    console.log("uploading...")
                    const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused')
                            break;
                        case 'running':
                            console.log('Upload is running')
                            break;
                    }
                    setProgress(pct)
                }, (err) => {
                    console.log("error while uploading...")
                    setError(String(err))
                    setUploading(false)
                    reject(err)
                }, async () => {
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref)
                        // store metadata in Firestore under businesses/{businessId}.evidence array
                        const businessRef = doc(db!, 'businesses', businessId)
                        await runTransaction(db!, async (tx) => {
                            const snap = await tx.get(businessRef)
                            if (!snap.exists()) throw new Error('Business not found')
                            const entry = {
                                id: `${timestamp}_${file.name}`,
                                name: file.name,
                                path,
                                url,
                                uploadedBy: user_id,
                                uploadedAt: new Date(timestamp).toISOString(),
                            }
                            tx.update(businessRef, { evidence: arrayUnion(entry) })
                        })
                        setProgress(100)
                        resolve()
                    } catch (err) {
                        console.error('Upload failed', err)
                        setError(String(err))
                        reject(err)
                    } finally {
                        setUploading(false)
                    }
                })
            })
                // clear file input value
                ; (e.target as HTMLInputElement).value = ''
        } catch (err) {
            console.error('Could not upload...', err)
        } finally {
            setUploading(false)
            setProgress(null)
        }
    }

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="file" accept=".pdf,.doc,.docx,.png,.jpg" onChange={handleFile} disabled={Boolean(disabled) || uploading} />
                {uploading && progress !== null && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{progress}%</span>
                )}
            </div>
            {error && <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: 6 }}>{error}</div>}
        </div>
    )
}