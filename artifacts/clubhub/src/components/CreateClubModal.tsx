import { useState } from "react";
import { useCreateClub, type CreateClubBodyType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { getGetLeadingClubsQueryKey, getGetClubsQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { PhotoUpload } from "./PhotoUpload";

const DESCRIPTION_MAX = 500;

interface CreateClubModalProps {
  onClose: () => void;
  onCreated?: (clubId: number) => void;
}

export function CreateClubModal({ onClose, onCreated }: CreateClubModalProps) {
  const { user } = useAuth();
  const createMutation = useCreateClub();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("");
  const [location, setLocation] = useState("");
  const [chatLink, setChatLink] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [leaders, setLeaders] = useState([{ name: user?.full_name || "", role: "President", email: user?.email || "" }]);

  const handleSubmit = () => {
    if (!name || !type || !day || !location || !description || !leaders[0].name) {
      toast.error("Please fill all required fields.");
      return;
    }

    createMutation.mutate({
      data: {
        name,
        type: type as CreateClubBodyType,
        description,
        default_day: day,
        default_location: location,
        chat_link: chatLink || undefined,
        profile_photo: photoUrl || undefined,
        leaders: leaders.filter(l => l.name && l.role && l.email)
      }
    }, {
      onSuccess: (data) => {
        toast.success("Club created successfully!");
        queryClient.invalidateQueries({ queryKey: getGetLeadingClubsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClubsQueryKey() });
        if (onCreated && data.club_id) {
          onCreated(data.club_id);
        } else {
          onClose();
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create club");
      }
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold">Create New Club</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Club Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Debate Team" className="h-11 rounded-xl bg-surface" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Club Type *</label>
              <Select value={type} onValueChange={(v: string) => setType(v)}>
                <SelectTrigger className="h-11 rounded-xl bg-surface">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Club">Club</SelectItem>
                  <SelectItem value="Committee">Committee</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                  <SelectItem value="Union">Union</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Description *</label>
              <span className={`text-xs font-medium ${description.length > DESCRIPTION_MAX ? "text-error" : "text-secondary"}`}>
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              rows={3}
              placeholder="What is this club about?"
              className="rounded-xl bg-surface resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Meeting Day *</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-11 rounded-xl bg-surface">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Meeting Location *</label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Room 402" className="h-11 rounded-xl bg-surface" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Chat Link (Optional)</label>
            <Input value={chatLink} onChange={e => setChatLink(e.target.value)} placeholder="Discord, WhatsApp, etc." className="h-11 rounded-xl bg-surface" />
          </div>

          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />

          <div className="pt-4 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-on-surface">Leaders</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaders([...leaders, { name: "", role: "", email: "" }])}
                className="rounded-full text-xs h-8"
              >
                <span className="material-symbols-outlined text-[16px] mr-1">add</span> Add Leader
              </Button>
            </div>

            <div className="space-y-3">
              {leaders.map((leader, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface p-3 rounded-xl border border-outline-variant/30">
                  <div className="grid grid-cols-3 gap-2 flex-grow">
                    <Input value={leader.name} onChange={e => {
                      const newL = [...leaders]; newL[i].name = e.target.value; setLeaders(newL);
                    }} placeholder="Name" className="h-9 text-sm" />
                    <Input value={leader.role} onChange={e => {
                      const newL = [...leaders]; newL[i].role = e.target.value; setLeaders(newL);
                    }} placeholder="Role (e.g. VP)" className="h-9 text-sm" />
                    <Input value={leader.email} onChange={e => {
                      const newL = [...leaders]; newL[i].email = e.target.value; setLeaders(newL);
                    }} placeholder="Email" type="email" className="h-9 text-sm" />
                  </div>
                  {i > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove leader"
                      className="h-9 w-9 text-error hover:bg-error/10 hover:text-error"
                      onClick={() => {
                        const newL = [...leaders]; newL.splice(i, 1); setLeaders(newL);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6">Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-primary text-white rounded-xl px-8 shadow-sm">
            {createMutation.isPending ? "Creating..." : "Create Club"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
