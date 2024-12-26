'use client'

import { useState, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Copy, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Card } from '@/components/ui/card'
import confetti from 'canvas-confetti';
import { JsonIncrementerDialog } from '../components/json-incrementer-dialog'

type WeightData = {
    [key: string]: number
}

export default function WeightedSpinner() {
    const [weights, setWeights] = useState<WeightData>({
        "A": 4,
        "B": 4,
        "C": 3,
        "D": 3,
        "E": 3,
        "F": 2,
        "G": 2,
        "H": 2
    })
    const [isSpinning, setIsSpinning] = useState(false)
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
    const wheelRef = useRef<HTMLDivElement>(null)
    const [importText, setImportText] = useState('')
    const [exportText, setExportText] = useState('')
    const [showPopup, setShowPopup] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    // Calculate total weight and segment angles
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    const segments = Object.entries(weights)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, weight]) => ({
            id: key,
            weight,
            percentage: (weight / totalWeight) * 100
        }))

    // Function to get random weighted selection
    const getWeightedRandom = () => {
        const random = Math.random() * totalWeight
        let sum = 0
        for (const [key, weight] of Object.entries(weights)) {
            sum += weight
            if (random < sum) return key
        }
        return Object.keys(weights)[0]
    }

    const spinWheel = async () => {
        if (isSpinning) return

        setIsSpinning(true)
        const selected = getWeightedRandom()
        const rotations = 5 // Number of full rotations
        const segmentIndex = segments.findIndex(seg => seg.id === selected)
        const segmentOffset = segments
            .slice(0, segmentIndex)
            .reduce((sum, seg) => sum + seg.percentage, 0)
        const finalAngle = (360 * rotations) + (segmentOffset * 3.6) + (segments[segmentIndex].percentage * 3.6 / 2)

        await animate(wheelRef.current!, 
            { rotate: [0, finalAngle] },
            { duration: 5, ease: "easeOut" }
        )

        setSelectedSegment(selected)
        
        // Increase weight of unpicked segments and set selected to 1
        setWeights(prev => {
          const newWeights = { ...prev };
          Object.keys(newWeights).forEach(key => {
            if (key !== selected && newWeights[key] !== 0) {
              newWeights[key] += 1;
            } else {
              newWeights[key] = 0;
            }
          });
          return newWeights;
        });

        setIsSpinning(false)
        setShowPopup(true)
        setShowConfetti(true)
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 500,
            spread: 1000,
            origin: { y: 0.6 }
          });
        }
        setTimeout(() => setShowConfetti(false), 5000)
    }

    const handleImport = () => {
        try {
            const imported = JSON.parse(importText)
            setWeights(imported)
            setImportText('')
            toast({
                title: "Import Successful",
                description: "The wheel has been updated with the imported data.",
            })
        } catch (error) {
            console.error('Error importing data:', error)
            toast({
                title: "Import Failed",
                description: "Please check your JSON format and try again.",
                variant: "destructive",
            })
        }
    }

    const handleExport = () => {
        const dataStr = JSON.stringify(weights, null, 2)
        setExportText(dataStr)
    }

    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportText)
        toast({
            title: "Copied to Clipboard",
            description: "The export data has been copied to your clipboard.",
        })
    }

    const [newEntry, setNewEntry] = useState({ name: '', value: '' })
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEntry.name || !newEntry.value) return
        
        const value = parseInt(newEntry.value)
        if (isNaN(value) || value < 1) return
        
        setWeights(prev => ({
            ...prev,
            [newEntry.name]: value
        }))
        
        setNewEntry({ name: '', value: '' })
        setDialogOpen(false)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
            <h1 className="text-4xl font-bold tracking-tight">WHEEL OF RANDOM</h1>
            <div className="relative w-96 h-96">
                {/* Pointer */}
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8 z-10">
                    <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[32px] border-r-red-500" />
                </div>
                
                {/* Wheel */}
                <motion.div 
                    ref={wheelRef}
                    className="w-full h-full rounded-full border-4 border-gray-800 overflow-hidden relative"
                    style={{ transformOrigin: 'center' }}
                >
                    {segments.map((segment, index) => {
                        const offset = segments
                            .slice(0, index)
                            .reduce((sum, seg) => sum + seg.percentage, 0)
                        
                        return (
                            <div
                                key={segment.id}
                                className="absolute top-0 left-0 w-full h-full"
                                style={{
                                    transform: `rotate(${offset * 3.6}deg)`,
                                    transformOrigin: '50% 50%',
                                }}
                            >
                                <div
                                    className={`absolute top-0 left-1/2 -ml-px h-1/2 w-0.5 origin-bottom rotate-[${
                                        segment.percentage * 3.6
                                    }deg] bg-gray-800`}
                                />
                                <div
                                    className="absolute top-0 left-1/2 w-max -translate-x-1/2 translate-y-[4.5rem] rotate-90"
                                >
                                    <span className="text-lg font-bold whitespace-nowrap">
                                        {segment.id} ({segment.weight})
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            </div>
            <div className="flex gap-4">
                <Button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="px-8 py-2 text-lg"
                >
                    {isSpinning ? 'Spinning...' : 'SPIN'}
                </Button>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Entry</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newEntry.name}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter name (e.g. A, B, C)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Weight Value</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="1"
                                    value={newEntry.value}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter weight (e.g. 1, 2, 3)"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Add Entry
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4 w-full max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="import">Import Data (JSON)</Label>
                    <div className="flex gap-2">
                        <Textarea
                            id="import"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Paste JSON data here"
                            className="flex-grow"
                        />
                        <Button onClick={handleImport}>Import</Button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="export">Export Data</Label>
                    <div className="flex gap-2">
                        <Textarea
                            id="export"
                            value={exportText}
                            readOnly
                            placeholder="Click 'Export' to see data"
                            className="flex-grow"
                        />
                        <div className="flex flex-col gap-2">
                            <Button onClick={handleExport}>Export</Button>
                            <Button onClick={handleCopyExport} variant="outline">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-sm space-y-1">
                {Object.entries(weights)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, weight]) => (
                        <div key={key}>
                            {key} -- {weight}
                        </div>
                    ))}
            </div>
            {showPopup && selectedSegment && (
                <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setShowPopup(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold mb-4">Selected: {selectedSegment}</h2>
                    <p>Congratulations! {selectedSegment} has been picked!</p>
                </Card>
            )}
            <div className="mt-4">
                <JsonIncrementerDialog />
            </div>
        </div>
    )
}

