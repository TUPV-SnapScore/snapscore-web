'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

interface EssayResponse {
  essayContent: string
  studentName: string
  criteria: {
    name: string
    rating: number
    maxRating: number
  }[]
}

interface IdentificationItem {
  itemNumber: number
  correctAnswer: string
  studentAnswer: string
  isCorrect: boolean
  manualCheck: boolean
}

interface IdentificationResponse {
  items: IdentificationItem[]
  studentName: string
}

interface ImageUploaderProps {
  type: 'essay' | 'identification'
  assessmentId: string
}

export default function ImageUploader({ type, assessmentId }: ImageUploaderProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const endpoint = process.env.NEXT_PUBLIC_SERVER_URL + (type === 'essay' ? '/essay' : '/identification')

  const submitEssayResult = async (essayData: EssayResponse) => {
    try {
      const totalScore = essayData.criteria.reduce((acc, criterion) => {
        return acc + (criterion.rating / criterion.maxRating) * 100;
      }, 0) / essayData.criteria.length;

      const requestBody = {
        studentName: essayData.studentName,
        assessmentId,
        score: totalScore,
        questionResults: [{
          questionId: '1',
          score: totalScore,
          essayCriteriaResults: essayData.criteria.map(criterion => ({
            criteriaId: criterion.name.toLowerCase(),
            score: (criterion.rating / criterion.maxRating) * 100
          }))
        }]
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/essay-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to save essay result');
      return await response.json();
    } catch (error) {
      console.error('Error submitting essay result:', error);
      throw error;
    }
  }

  const submitIdentificationResult = async (identificationData: IdentificationResponse) => {
    try {
      const requestBody = {
        studentName: identificationData.studentName,
        assessmentId,
        questionResults: identificationData.items.map((item, index) => ({
          questionId: (index + 1).toString(),
          isCorrect: item.isCorrect
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/identification-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to save identification result');
      return await response.json();
    } catch (error) {
      console.error('Error submitting identification result:', error);
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image to upload.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      let resultId: string

      if (type === 'essay') {
        const essayResult = await submitEssayResult(data)
        resultId = essayResult.id

        const averageScore = data.criteria.reduce((acc: number, criterion: { rating: number; maxRating: number }) => 
          acc + (criterion.rating / criterion.maxRating) * 100, 0) / data.criteria.length;
        
        setMessage({ 
          type: 'success', 
          text: `Essay submitted successfully! Average score: ${averageScore.toFixed(1)}%` 
        })
      } else {
        const identificationResult = await submitIdentificationResult(data)
        resultId = identificationResult.id

        const correctAnswers = data.items.filter((item: { isCorrect: boolean }) => item.isCorrect).length
        const totalQuestions = data.items.length
        
        setMessage({ 
          type: 'success', 
          text: `Score: ${correctAnswers} out of ${totalQuestions}` 
        })
      }

      router.push(`/assessments/${assessmentId}/${type}/${resultId}`)

    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Failed to process image. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-x-4 flex flex-row max-w-2xl py-4">
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isLoading}
          className='w-52 bg-white border border-black'
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Upload Image'}
        </Button>
      </form>
      {message && (
        <div className={`p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}