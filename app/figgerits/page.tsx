import Figgerits from '@/components/Figgerits';
import { PuzzleData } from '@/utils/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function fetchPuzzleData(cookie: string): Promise<PuzzleData> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/puzzle`, {
        headers: {
            cookie: cookie || '',
        },
    });

    if (res.status === 401) {
        throw new Error('Unauthorized');
    }

    const puzzleData = await res.json();
    console.log(puzzleData);
    return { ...puzzleData, puzzleId: puzzleData._id };
}

const Game = async () => {
    const cookieHeader = await cookies();
    try {
        const puzzleData = await fetchPuzzleData(cookieHeader.toString());
        return (
            <Figgerits puzzleData={puzzleData} />
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            redirect('/');
        }
        throw error;
    }
};

export default Game;