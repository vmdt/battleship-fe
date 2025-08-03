import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useUserStore } from "@/stores/userStore";

export type CreateRoomOptions = {
  displayName: string;
  timePerTurn: string;
  whoPlayFirst: string;
  placingTime: string;
};

type CreateRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (options: CreateRoomOptions, userId: string) => void;
};

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [timePerTurn, setTimePerTurn] = useState("30");
  const [whoPlayFirst, setWhoPlayFirst] = useState("random");
  const [placingTime, setPlacingTime] = useState("120");
  const { user } = useUserStore();

  const handleCreate = () => {
    const displayName = user?.username || "Guest";
    onCreate({
      displayName,
      timePerTurn,
      whoPlayFirst,
      placingTime,
    }, user?.id || "");
  };

  return (
    <Modal
      id="create-room-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phòng mới"
      contentClassName="border-2"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleCreate}>
            Tạo phòng
          </Button>
        </>
      }
    >
      <div className="space-y-6">
          {/* Pannel Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timePerTurn">Thời gian mỗi lượt</Label>
                <Select value={timePerTurn} onValueChange={setTimePerTurn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 giây</SelectItem>
                    <SelectItem value="30">30 giây</SelectItem>
                    <SelectItem value="60">1 phút</SelectItem>
                    <SelectItem value="120">2 phút</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whoPlayFirst">Ai chơi trước</Label>
                <Select value={whoPlayFirst} onValueChange={setWhoPlayFirst}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người chơi trước" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Ngẫu nhiên</SelectItem>
                    <SelectItem value="host">Chủ phòng</SelectItem>
                    <SelectItem value="guest">Người tham gia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placingTime">Thời gian đặt tàu</Label>
                <Select value={placingTime} onValueChange={setPlacingTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian đặt tàu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 phút</SelectItem>
                    <SelectItem value="120">2 phút</SelectItem>
                    <SelectItem value="180">3 phút</SelectItem>
                    <SelectItem value="300">5 phút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
    </Modal>
  );
}