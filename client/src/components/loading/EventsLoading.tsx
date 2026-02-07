'use client'

export default function EventsLoading() {
    return (
        <div className="pt-16 min-h-screen bg-primary">
            {/* Header Skeleton */}
            <section className="bg-gradient-hero py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="h-12 w-64 bg-tertiary rounded-lg mx-auto mb-6 animate-pulse" />
                        <div className="h-6 w-96 bg-tertiary rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Events Grid Skeleton */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card overflow-hidden">
                                {/* Image placeholder */}
                                <div className="h-48 bg-tertiary animate-pulse" />

                                {/* Content placeholder */}
                                <div className="p-6 space-y-4">
                                    <div className="h-6 w-3/4 bg-tertiary rounded animate-pulse" />
                                    <div className="h-4 w-full bg-tertiary rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-tertiary rounded animate-pulse" />

                                    <div className="space-y-2">
                                        <div className="h-4 w-1/2 bg-tertiary rounded animate-pulse" />
                                        <div className="h-4 w-1/3 bg-tertiary rounded animate-pulse" />
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <div className="h-8 w-16 bg-tertiary rounded animate-pulse" />
                                        <div className="h-10 w-28 bg-tertiary rounded-lg animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
