import { useState, useEffect } from "react";
import { useGetClub, useUpdateClub, type CreateClubBodyType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function EditClubModal({ clubId, onClose }: { clubId: number, onClose: () => void }) {
  const { data, isLoading } = useGetClub(clubId);
  const updateMutation = useUpdateClub();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("");
  const [location, setLocation] = useState("");
  const [chatLink, setChatLink] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [leaders, setLeaders] = useState([{ name: "", role: "", email: "" }]);

  useEffect(() => {
    if (data?.success && data.club) {
      const c = data.club;
      setName(c.name);
      setType(c.type as string);
      setDescription(c.description);
      setDay(c.default_day);
      setLocation(c.default_location);
      setChatLink(c.chat_link || "");
      setPhotoUrl(c.profile_photo || "");
      setLeaders(c.leaders?.length ? c.leaders : [{ name: "", role: "", email: "" }]);
    }
  }, [data]);

  const handleSubmit = () => {
    if (!name || !type || !day || !location || !description || !leaders[0].name) {
      toast.error("Please fill all required fields.");
      return;
    }

    updateMutation.mutate({
      id: clubId,
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
      onSuccess: () => {
        toast.success("Club updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
        onClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update club");
      }
    });
  };

  if (isLoading) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold">Edit Club Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Club Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl bg-surface" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Club Type *</label>
              <Select value={type} onValueChange={(v: string) => setType(v)}>
                <SelectTrigger className="h-11 rounded-xl bg-surface">
                  <SelectValue />
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
            <label className="text-sm font-medium text-secondary">Description *</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="rounded-xl bg-surface resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Meeting Day *</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-11 rounded-xl bg-surface">
                  <SelectValue />
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
              <Input value={location} onChange={e => setLocation(e.target.value)} className="h-11 rounded-xl bg-surface" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Chat Link</label>
              <Input value={chatLink} onChange={e => setChatLink(e.target.value)} className="h-11 rounded-xl bg-surface" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Profile Photo URL</label>
              <Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="h-11 rounded-xl bg-surface" />
            </div>
          </div>

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
                    }} placeholder="Role" className="h-9 text-sm" />
                    <Input value={leader.email} onChange={e => {
                      const newL = [...leaders]; newL[i].email = e.target.value; setLeaders(newL);
                    }} placeholder="Email" type="email" className="h-9 text-sm" />
                  </div>
                  {i > 0 && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-error hover:bg-error/10 hover:text-error" onClick={() => {
                      const newL = [...leaders]; newL.splice(i, 1); setLeaders(newL);
                    }}>
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
          <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="bg-primary text-white rounded-xl px-8 shadow-sm">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
