import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              About <span className="text-indigo-600 dark:text-indigo-400">EventHub</span>
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              We're passionate about connecting people with amazing experiences. Our mission is to make event discovery and booking as simple and enjoyable as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-secondary mb-6">
                At EventHub, we believe that great events bring people together and create lasting memories. Our platform is designed to bridge the gap between event organizers and attendees, making it easier than ever to discover, book, and attend amazing events.
              </p>
              <p className="text-lg text-secondary">
                Whether you're looking for professional conferences, exciting concerts, educational workshops, or community gatherings, we're here to help you find your next great experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">10K+</div>
                <div className="text-secondary">Events Listed</div>
              </div>
              <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">50K+</div>
                <div className="text-secondary">Happy Users</div>
              </div>
              <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">500+</div>
                <div className="text-secondary">Cities Covered</div>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99%</div>
                <div className="text-secondary">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              What We Stand For
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Our core values guide everything we do, from product development to customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Reliability</h3>
              <p className="text-secondary">
                We ensure every booking is secure and every event listing is verified.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Speed</h3>
              <p className="text-secondary">
                Quick and easy booking process that takes just minutes to complete.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Security</h3>
              <p className="text-secondary">
                Your personal information and payments are protected with industry-leading security.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Passion</h3>
              <p className="text-secondary">
                We're passionate about creating memorable experiences for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}