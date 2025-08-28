import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/auth-hook";
export function Welcome() {
  const {loginWithRedirect} = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to LifeSheet</h1>
          <p className="text-xl text-gray-600">Your CV management and tailoring solution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Your Professional Journey</h2>
            <p className="text-lg mb-4">
              LifeSheet helps you organize, update, and tailor your CV for different job applications,
              ensuring you always put your best foot forward.
            </p>
            <Button size="lg" onClick={()=>{loginWithRedirect()}} className="mt-4">
              Get Started
            </Button>
          </div>
          <div className="relative h-64 md:h-96">
            <img
              src="/placeholder.svg"
              alt="LifeSheet Dashboard Preview"
              style={{ objectFit: "contain" }}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Store & Organize</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Keep all your professional experience, education, and skills in one place.
                Never lose track of your achievements.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tailor & Customize</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Adjust your CV for specific job applications. Highlight relevant experience
                and skills for each opportunity.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Generate professional-looking CVs in multiple formats and share them
                directly with potential employers.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to level up your job applications?</h2>
          <Button size="lg" onClick={()=>{loginWithRedirect()}} variant="default" className="mt-2">
            Sign In to Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
