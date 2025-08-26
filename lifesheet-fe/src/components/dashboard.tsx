import { useNavigate } from "react-router-dom";
import TailoredCVs from "./tailored-cvs";
import { Button } from "./ui/button";
import { Award, Download, LogOut, UserRoundPen } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export function Dashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth0();
    return (<>
        <div className="flex flex-row-reverse">
            <Button onClick={() => logout()} variant="outline" className="btn-custom">
                <LogOut className="h-4 w-4 mr-2" />
            </Button>
            <Button onClick={() => navigate("/plans")} variant="outline" className="btn-custom">
                <Award className="h-4 w-4 mr-2" />
            </Button>
            <Button onClick={() => navigate("/cv-data")} variant="outline" className="btn-custom">
                <UserRoundPen className="h-4 w-4 mr-2" />
            </Button>
            <Button onClick={() => navigate("/export-pdf")} variant="outline" className="btn-custom">
                <Download className="h-4 w-4 mr-2" />
                Export my CV
            </Button>

        </div>
        <div>
            <TailoredCVs />
        </div>
    </>
    )
}
