import { useState, useRef, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Users2, Target, Save, Upload, Link, AlertCircle, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile, TeamMember, TeamMemberRole } from '@/types';

interface TeamManagementProps {
  profile: ClaimedProfile;
  xUserId: string;
}

type ImageInputMode = 'url' | 'upload';

interface TeamMemberFormData {
  imageUrl: string;
  name: string;
  nickname: string;
  jobTitle: string;
  whyFit: string;
  role: TeamMemberRole;
  customRole: string;
}

const emptyFormData: TeamMemberFormData = {
  imageUrl: '',
  name: '',
  nickname: '',
  jobTitle: '',
  whyFit: '',
  role: 'developer',
  customRole: '',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function TeamManagement({ profile, xUserId }: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(profile.teamMembers || []);
  const [stakingPitch, setStakingPitch] = useState(profile.stakingPitch || '');
  const [formData, setFormData] = useState<TeamMemberFormData>(emptyFormData);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateProfile = useUpdateProfile();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMember = () => {
    if (!formData.name.trim() || !formData.jobTitle.trim()) {
      toast.error('Name and Job Title are required');
      return;
    }

    if (formData.role === 'other' && !formData.customRole.trim()) {
      toast.error('Please specify the role');
      return;
    }

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      imageUrl: formData.imageUrl || undefined,
      name: formData.name.trim(),
      nickname: formData.nickname.trim() || undefined,
      jobTitle: formData.jobTitle.trim(),
      whyFit: formData.whyFit.trim(),
      role: formData.role,
      customRole: formData.role === 'other' ? formData.customRole.trim() : undefined,
      order: teamMembers.length,
    };

    setTeamMembers([...teamMembers, newMember]);
    setFormData(emptyFormData);
    setIsAddingMember(false);
    toast.success('Team member added - click Save to persist');
  };

  const handleEditMember = (member: TeamMember) => {
    setFormData({
      imageUrl: member.imageUrl || '',
      name: member.name,
      nickname: member.nickname || '',
      jobTitle: member.jobTitle,
      whyFit: member.whyFit,
      role: member.role,
      customRole: member.customRole || '',
    });
    setEditingMemberId(member.id);
    setIsAddingMember(true);
    setImageInputMode(member.imageUrl ? 'url' : 'upload');
  };

  const handleUpdateMember = () => {
    if (!formData.name.trim() || !formData.jobTitle.trim()) {
      toast.error('Name and Job Title are required');
      return;
    }

    if (formData.role === 'other' && !formData.customRole.trim()) {
      toast.error('Please specify the role');
      return;
    }

    setTeamMembers(prev => prev.map(m => 
      m.id === editingMemberId 
        ? {
            ...m,
            imageUrl: formData.imageUrl || undefined,
            name: formData.name.trim(),
            nickname: formData.nickname.trim() || undefined,
            jobTitle: formData.jobTitle.trim(),
            whyFit: formData.whyFit.trim(),
            role: formData.role,
            customRole: formData.role === 'other' ? formData.customRole.trim() : undefined,
          }
        : m
    ));
    setFormData(emptyFormData);
    setIsAddingMember(false);
    setEditingMemberId(null);
    toast.success('Team member updated - click Save to persist');
  };

  const handleCancelForm = () => {
    setIsAddingMember(false);
    setEditingMemberId(null);
    setFormData(emptyFormData);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success('Team member removed - click Save to persist');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        profileId: profile.id,
        xUserId,
        updates: {
          team_members: teamMembers,
          staking_pitch: stakingPitch,
        },
      });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    JSON.stringify(teamMembers) !== JSON.stringify(profile.teamMembers || []) ||
    stakingPitch !== (profile.stakingPitch || '');

  // Warn before browser close/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Block in-app navigation when unsaved changes exist
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname
  );

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
                <Users2 className="h-4 w-4 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription className="mt-1">
                Showcase the people building this project
              </CardDescription>
            </div>
            {!isAddingMember && (
              <Button 
                onClick={() => setIsAddingMember(true)} 
                size="sm" 
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Owner Card - Locked, non-editable */}
          <div className="flex items-start gap-3 rounded-sm border border-primary/30 bg-primary/5 p-3">
            <Avatar className="h-10 w-10 border border-primary/30">
              <AvatarImage src={profile.logoUrl || profile.xAvatarUrl || undefined} alt={profile.xDisplayName || profile.xUsername || profile.projectName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(profile.xDisplayName || profile.xUsername || profile.projectName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {profile.xUsername ? `@${profile.xUsername}` : profile.projectName}
                </span>
                <Badge variant="default" className="text-xs">Founder</Badge>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Owner</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Project Owner</p>
              <p className="mt-1 text-xs text-muted-foreground/60 italic">Auto-generated from your profile</p>
            </div>
          </div>

          {/* Add Member Form */}
          {isAddingMember && (
            <div className="rounded-sm border border-primary/30 bg-primary/5 p-4 space-y-4">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {editingMemberId ? 'Edit Team Member' : 'Add New Team Member'}
              </h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Profile Image</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={imageInputMode === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageInputMode('upload')}
                      className="gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={imageInputMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageInputMode('url')}
                      className="gap-1.5"
                    >
                      <Link className="h-3.5 w-3.5" />
                      URL
                    </Button>
                  </div>
                  
                  {imageInputMode === 'upload' ? (
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-1.5"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Choose Image'}
                      </Button>
                      {formData.imageUrl && (
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={formData.imageUrl} alt="Preview" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            IMG
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ) : (
                    <Input
                      id="imageUrl"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    maxLength={50}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    placeholder="johndoe"
                    maxLength={20}
                    value={formData.nickname}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: TeamMemberRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder">Founder</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.role === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customRole">Specify Role *</Label>
                    <Input
                      id="customRole"
                      placeholder="e.g., Designer, Marketing"
                      maxLength={30}
                      value={formData.customRole}
                      onChange={e => setFormData({ ...formData, customRole: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="jobTitle">Job Description *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Lead Smart Contract Developer"
                    maxLength={100}
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="whyFit">
                    Why I'm a Fit for This Project
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formData.whyFit.length}/200)
                    </span>
                  </Label>
                  <Textarea
                    id="whyFit"
                    placeholder="Briefly explain what makes you the right person for this role..."
                    maxLength={200}
                    rows={3}
                    value={formData.whyFit}
                    onChange={e => setFormData({ ...formData, whyFit: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>
                <Button onClick={editingMemberId ? handleUpdateMember : handleAddMember}>
                  {editingMemberId ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </div>
          )}

          {/* Team Members List */}
          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers
                .sort((a, b) => a.order - b.order)
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-3 rounded-sm border border-border bg-muted/30 p-3"
                  >
                    <div className="flex h-full items-center text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={member.imageUrl} alt={member.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{member.name}</span>
                        {member.nickname && (
                          <span className="text-xs text-muted-foreground">@{member.nickname}</span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {member.role === 'other' ? member.customRole : member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.jobTitle}</p>
                      {member.whyFit && (
                        <p className="mt-1 text-xs italic text-muted-foreground/80 line-clamp-1">
                          "{member.whyFit}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => handleEditMember(member)}
                        disabled={isAddingMember}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : !isAddingMember && (
            <div className="rounded-sm border border-dashed border-border py-8 text-center">
              <Users2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground/70">Add your first team member above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staking Pitch Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
            <Target className="h-4 w-4 text-primary" />
            Why Should People Stake?
          </CardTitle>
          <CardDescription>
            Write a compelling pitch for why the public should support this project (max 500 characters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Our protocol solves a critical problem in DeFi by providing... We've built a strong foundation with... Staking now gives you..."
            maxLength={500}
            rows={4}
            value={stakingPitch}
            onChange={e => setStakingPitch(e.target.value)}
            className="resize-none"
          />
          <p className="mt-2 text-xs text-muted-foreground text-right">
            {stakingPitch.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Fixed Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            <span>You have unsaved changes</span>
          </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Team & Pitch'}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Blocker Dialog */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved team changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
