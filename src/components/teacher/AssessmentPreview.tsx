interface AssessmentPreviewProps {
  title: string;
}

export default function AssessmentPreview({title} : AssessmentPreviewProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-black">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          📚
        </div>
        <span className="text-gray-700 text-sm">{title}</span>
      </div>
    </div>
  )
}