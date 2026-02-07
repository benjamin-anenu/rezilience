import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Video, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile } from '@/types';

interface BuildInPublicEntry {
  id: string;
  url: string;
  title: string;
  description?: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

interface BuildInPublicTabProps {
  profile: ClaimedProfile;
  xUserId: string;
}

export function BuildInPublicTab({ profile, xUserId }: BuildInPublicTabProps) {
  // Parse existing videos from profile
  const initialVideos: BuildInPublicEntry[] = (profile.buildInPublicVideos || []).map((v) => ({
    id: v.id,
    url: v.url || v.tweetUrl,
    title: v.title || '',
    description: (v as unknown as BuildInPublicEntry).description || '',
    uploadedAt: (v as unknown as BuildInPublicEntry).uploadedAt || v.timestamp || new Date().toISOString(),
    thumbnailUrl: v.thumbnailUrl,
  }));

  const [videos, setVideos] = useState<BuildInPublicEntry[]>(initialVideos);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const updateProfile = useUpdateProfile();

  const isValidXUrl = (url: string): boolean => {
    return url.includes('x.com') || url.includes('twitter.com');
  };

  const handleAddVideo = () => {
    if (!newUrl.trim() || !newTitle.trim()) return;
    if (!isValidXUrl(newUrl)) return;

    const newEntry: BuildInPublicEntry = {
      id: `bip_${Date.now()}`,
      url: newUrl,
      title: newTitle,
      description: newDescription || undefined,
      uploadedAt: new Date().toISOString(),
    };

    const updatedVideos = [...videos, newEntry];
    setVideos(updatedVideos);
    setNewUrl('');
    setNewTitle('');
    setNewDescription('');

    // Auto-save
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { build_in_public_videos: updatedVideos },
    });
  };

  const handleRemoveVideo = (id: string) => {
    const filtered = videos.filter((v) => v.id !== id);
    setVideos(filtered);

    // Auto-save
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { build_in_public_videos: filtered },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* X Encouragement Banner */}
      <Card className="border-foreground/20 bg-foreground/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <span className="text-2xl font-bold">𝕏</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold uppercase tracking-tight">
                Build In Public
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your progress on X with video updates. Building in public creates trust 
                and transparency with your community. Link your video updates here to showcase 
                your development journey.
              </p>
              {profile.socials.xHandle && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  asChild
                >
                  <a
                    href={`https://x.com/${profile.socials.xHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="mr-2">𝕏</span>
                    View @{profile.socials.xHandle}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Videos */}
      {videos.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg uppercase tracking-tight">
              Your Video Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-start gap-4 rounded-sm border border-border bg-muted/30 p-4"
                >
                  {/* Thumbnail or placeholder */}
                  <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-sm bg-muted">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full rounded-sm object-cover"
                      />
                    ) : (
                      <Video className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-semibold truncate">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Added {formatDate(video.uploadedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs"
                      asChild
                    >
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View on X
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveVideo(video.id)}
                      disabled={updateProfile.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Video */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Add Video Update
          </CardTitle>
          <CardDescription>
            Link a video update from X/Twitter to showcase your Build In Public journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">X/Twitter Video URL *</Label>
            <Input
              id="video-url"
              placeholder="https://x.com/yourproject/status/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={newUrl && !isValidXUrl(newUrl) ? 'border-destructive' : ''}
            />
            {newUrl && !isValidXUrl(newUrl) && (
              <p className="text-xs text-destructive">
                Please enter a valid X/Twitter URL
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-title">Title *</Label>
            <Input
              id="video-title"
              placeholder="Sprint 3 Demo: New Dashboard UI"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value.slice(0, 100))}
              maxLength={100}
            />
            <p className="text-right text-[10px] text-muted-foreground">
              {newTitle.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Description (optional)</Label>
            <Textarea
              id="video-description"
              placeholder="Brief description of what this update covers..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value.slice(0, 280))}
              maxLength={280}
              rows={3}
            />
            <p className="text-right text-[10px] text-muted-foreground">
              {newDescription.length}/280
            </p>
          </div>

          <Button
            onClick={handleAddVideo}
            disabled={!newUrl.trim() || !newTitle.trim() || !isValidXUrl(newUrl) || updateProfile.isPending}
            className="w-full font-display uppercase tracking-wider"
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Video Update
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
