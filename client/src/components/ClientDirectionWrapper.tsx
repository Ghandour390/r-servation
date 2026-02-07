'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

export default function ClientDirectionWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { direction, language } = useSelector((state: RootState) => state.language);

    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [direction, language]);

    return <>{children}</>;
}
