import { useNavigate } from 'react-router-dom';
import { useUsersTailoredCVs } from '@/hooks/use-users-tailored-cvs';
import { Button } from './ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function TailoredCVs() {
  const navigate = useNavigate();
  const { tailoredCVs, isLoading, error } = useUsersTailoredCVs();

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h2 className="text-2xl font-semibold mb-4">Tailored CVs</h2>
      <div className="flex justify-between items-center">
        <div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>


            <Button
              onClick={() => navigate('/tailor-cv')}
              variant="default"
              className="btn-custom ml-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tailor a CV
            </Button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading tailored CVs…</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : tailoredCVs.length === 0 ? (
        <div className="text-sm text-muted-foreground">No tailored CVs found.</div>
      ) : (
        <ul className="space-y-2">
          {tailoredCVs.map(item => (
            <li key={item._id}>
              <button
                onClick={() => navigate(`/export-pdf?cvId=${encodeURIComponent(String(item._id))}`)}
                className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                aria-label={`Open tailored CV ${item._id}`}
              >
                <div>
                  <div className="font-medium">CV tailored for {item.companyName}</div>
                  <div className="text-xs text-muted-foreground">
                    on {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">Open</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
