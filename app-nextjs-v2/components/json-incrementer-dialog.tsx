'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Copy } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function JsonIncrementerDialog() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [namesInput, setNamesInput] = useState('')
    const [jsonInput, setJsonInput] = useState('')
    const [processedOutput, setProcessedOutput] = useState('')

    const handleIncrement = () => {
        try {
            const data = JSON.parse(input)
            const incremented = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, Number(value) + 1])
            )
            setOutput(JSON.stringify(incremented, null, 2))
        } catch (error) {
            toast({
                title: "Invalid JSON",
                description: "Please check your input format and try again.",
                variant: "destructive",
            })
        }
    }

    const handleProcess = () => {
        try {
            const names = JSON.parse(namesInput)
            const jsonData = JSON.parse(jsonInput)

            if (!Array.isArray(names)) {
                throw new Error("Names input must be an array")
            }

            const result = { ...jsonData }
            names.forEach(name => {
                if (!(name in result)) {
                    result[name] = 1
                }
            })

            setProcessedOutput(JSON.stringify(result, null, 2))
        } catch (error) {
            toast({
                title: "Invalid Input",
                description: "Please check your input format and try again.",
                variant: "destructive",
            })
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied to clipboard",
            description: "The output has been copied to your clipboard.",
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Extra Functionality</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Extra Functionality</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="incrementer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="incrementer">JSON Incrementer</TabsTrigger>
                        <TabsTrigger value="nameProcessor">Name Processor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="incrementer">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Input</h3>
                                    <Textarea
                                        placeholder="Paste your JSON here..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="min-h-[300px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Output</h3>
                                    <Textarea
                                        value={output}
                                        readOnly
                                        className="min-h-[300px]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <Button onClick={handleIncrement}>Process</Button>
                                <Button onClick={() => handleCopy(output)} variant="outline">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="nameProcessor">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Names (as array)</h3>
                                    <Input
                                        placeholder='["Name1", "Name2", "Name3"]'
                                        value={namesInput}
                                        onChange={(e) => setNamesInput(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">JSON (names and values)</h3>
                                    <Input
                                        placeholder='{"Name1": 5, "Name2": 3}'
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleProcess}>Process</Button>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Output</h3>
                                <Textarea
                                    value={processedOutput}
                                    readOnly
                                    className="min-h-[200px]"
                                />
                            </div>
                            <Button onClick={() => handleCopy(processedOutput)} variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy to Clipboard
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

