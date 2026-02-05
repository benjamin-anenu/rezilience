import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, CheckCircle, Github, Globe, FileCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubmitProject = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    programId: '',
    programName: '',
    githubUrl: '',
    websiteUrl: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.programName.trim()) {
      newErrors.programName = 'Program name is required';
    } else if (formData.programName.length > 100) {
      newErrors.programName = 'Program name must be less than 100 characters';
    }
    
    if (!formData.programId.trim()) {
      newErrors.programId = 'Program ID is required';
    } else if (!/^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(formData.programId.trim())) {
      newErrors.programId = 'Invalid Solana program ID format';
    }
    
    if (formData.githubUrl && !formData.githubUrl.match(/^https?:\/\/github\.com\/[^\/]+\/[^\/]+/)) {
      newErrors.githubUrl = 'Please enter a valid GitHub repository URL';
    }
    
    if (formData.websiteUrl && !formData.websiteUrl.match(/^https?:\/\/.+/)) {
      newErrors.websiteUrl = 'Please enter a valid URL starting with http:// or https://';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('add-project', {
        body: {
          program_id: formData.programId.trim(),
          program_name: formData.programName.trim(),
          github_url: formData.githubUrl.trim() || null,
          website_url: formData.websiteUrl.trim() || null,
          description: formData.description.trim() || null,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        if (data.error.includes('already exists')) {
          toast.error('This program has already been submitted');
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setIsSuccess(true);
      toast.success('Project submitted successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/program/${formData.programId.trim()}`);
      }, 2000);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center lg:px-8">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
              PROJECT SUBMITTED
            </h1>
            <p className="mb-6 text-muted-foreground">
              Your project has been added to the registry. We're now fetching GitHub data to calculate
              the initial Resilience Score.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to project page...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back link */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/explorer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explorer
              </Link>
            </Button>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                SUBMIT A PROJECT
              </h1>
              <p className="text-muted-foreground">
                Add a Solana program to the Resilience Registry for public scoring and tracking.
              </p>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-tight">
                  Project Details
                </CardTitle>
                <CardDescription>
                  Provide the program's on-chain address and optional metadata.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Program ID */}
                  <div className="space-y-2">
                    <Label htmlFor="programId" className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Program ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="programId"
                      placeholder="e.g., JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
                      value={formData.programId}
                      onChange={(e) => handleChange('programId', e.target.value)}
                      className={errors.programId ? 'border-destructive' : ''}
                    />
                    {errors.programId && (
                      <p className="text-sm text-destructive">{errors.programId}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      The Solana on-chain program address (Base58 encoded)
                    </p>
                  </div>

                  {/* Program Name */}
                  <div className="space-y-2">
                    <Label htmlFor="programName">
                      Program Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="programName"
                      placeholder="e.g., Jupiter Exchange"
                      value={formData.programName}
                      onChange={(e) => handleChange('programName', e.target.value)}
                      className={errors.programName ? 'border-destructive' : ''}
                      maxLength={100}
                    />
                    {errors.programName && (
                      <p className="text-sm text-destructive">{errors.programName}</p>
                    )}
                  </div>

                  {/* GitHub URL */}
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/org/repo"
                      value={formData.githubUrl}
                      onChange={(e) => handleChange('githubUrl', e.target.value)}
                      className={errors.githubUrl ? 'border-destructive' : ''}
                    />
                    {errors.githubUrl && (
                      <p className="text-sm text-destructive">{errors.githubUrl}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Link to the source repository for automatic score calculation
                    </p>
                  </div>

                  {/* Website URL */}
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="websiteUrl"
                      placeholder="https://example.com"
                      value={formData.websiteUrl}
                      onChange={(e) => handleChange('websiteUrl', e.target.value)}
                      className={errors.websiteUrl ? 'border-destructive' : ''}
                    />
                    {errors.websiteUrl && (
                      <p className="text-sm text-destructive">{errors.websiteUrl}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the program..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className={errors.description ? 'border-destructive' : ''}
                      rows={3}
                      maxLength={500}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 font-display uppercase tracking-wider"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Project'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-display text-sm font-semibold uppercase text-primary">
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Your project will appear in the Explorer immediately</li>
                  <li>• If a GitHub URL is provided, we'll fetch metrics and calculate a score</li>
                  <li>• To verify ownership and unlock full features, use the Claim Profile flow</li>
                  <li>• Stakers can bond SOL to your program to boost its Resilience Score</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitProject;
