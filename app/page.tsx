import DrawingCanvas from "../drawing-canvas"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Elemental Drawing Effects</h1>
          <p className="text-gray-600">Create beautiful fire and ice effects with your touch or mouse</p>
        </div>

        <DrawingCanvas width={800} height={600} />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Switch between fire and ice effects to create different elemental drawing styles</p>
        </div>
      </div>
    </div>
  )
}
