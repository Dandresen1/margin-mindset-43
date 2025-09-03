import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, TrendingUp, FileDown, History } from 'lucide-react';

interface AnonymousAnalysisCTAProps {
  analysisId: string;
}

export const AnonymousAnalysisCTA = ({ analysisId }: AnonymousAnalysisCTAProps) => {
  return (
    <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-background">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-primary">Love this analysis?</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a free account to unlock powerful features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Save className="w-4 h-4 text-primary" />
            <span>Save unlimited analyses</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4 text-primary" />
            <span>View history & trends</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Compare products</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileDown className="w-4 h-4 text-primary" />
            <span>Export PDF reports</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Link to="/auth" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Free Account
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 border-primary/30">
            Continue as Guest
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          This analysis will be lost when you close your browser
        </p>
      </CardContent>
    </Card>
  );
};