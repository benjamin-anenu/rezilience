import { useState } from 'react';
import { Plus, Trash2, GripVertical, Users2, Target, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile, TeamMember, TeamMemberRole } from '@/types';

interface TeamManagementProps {
  profile: ClaimedProfile;
  xUserId: string;
}

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
  const [isSaving, setIsSaving] = useState(false);
  
  const updateProfile = useUpdateProfile();

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
                Showcase the people building this protocol
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
          {/* Add Member Form */}
          {isAddingMember && (
            <div className="rounded-sm border border-primary/30 bg-primary/5 p-4 space-y-4">
              <h4 className="font-display text-sm font-semibold text-foreground">
                Add New Team Member
              </h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Profile Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
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
                  onClick={() => {
                    setIsAddingMember(false);
                    setFormData(emptyFormData);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>
                  Add Member
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
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 shadow-lg"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Team & Pitch'}
          </Button>
        </div>
      )}
    </div>
  );
}
