"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from './ui/button';

interface ResultProps {
    correct: boolean;
    quote: string;
    info: string;
    onNext: () => void;
    onBack: () => void;
    onReset: () => void;
}

function Result({ correct, quote, info, onNext, onBack, onReset }: ResultProps) {
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{correct ? 'Congratulations!' : 'Oops! Not quite right'}</DialogTitle>
                    <DialogDescription>
                        {correct ? "You've successfully guessed the quote!" : "Don't worry, you can try again!"}
                    </DialogDescription>
                </DialogHeader>
                
                {correct ? (
                    <>
                        <div className="grid gap-4 py-4">
                            <blockquote className="italic text-lg border-l-4 border-primary pl-4">"{quote}"</blockquote>
                            <p className="text-sm text-muted-foreground">{info}</p>
                        </div>
                        <DialogFooter>
                            <Button onClick={onNext}>Next Puzzle</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex justify-center space-x-4 py-4">
                        <Button onClick={onBack} variant="outline">Go Back</Button>
                        <Button onClick={onReset} variant="destructive">Reset</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default Result;