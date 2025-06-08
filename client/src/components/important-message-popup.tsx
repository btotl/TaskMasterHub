import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ImportantMessage } from "@shared/schema";

interface ImportantMessagePopupProps {
  message: ImportantMessage;
  onClose: () => void;
}

export default function ImportantMessagePopup({ message, onClose }: ImportantMessagePopupProps) {
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/messages/${message.id}/acknowledge`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      onClose();
    },
  });

  const handleUnderstand = () => {
    acknowledgeMutation.mutate();
  };

  const handleShowLater = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brutal-yellow brutal-card p-8 max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-4xl mr-4" />
          <h3 className="text-2xl font-brutal font-black">IMPORTANT!</h3>
        </div>
        <h4 className="text-xl font-bold mb-2">{message.title}</h4>
        <p className="text-lg font-bold mb-6">{message.content}</p>
        <div className="flex gap-4">
          <Button
            onClick={handleUnderstand}
            disabled={acknowledgeMutation.isPending}
            className="brutal-button bg-brutal-green px-6 py-3 font-bold flex-1"
          >
            {acknowledgeMutation.isPending ? "PROCESSING..." : "I UNDERSTAND"}
          </Button>
          <Button
            onClick={handleShowLater}
            className="brutal-button bg-white px-6 py-3 font-bold flex-1"
          >
            SHOW LATER
          </Button>
        </div>
      </div>
    </div>
  );
}
