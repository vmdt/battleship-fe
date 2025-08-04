import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("CreateRoomModal");

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
      title={t("title")}
      contentClassName="border-2"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreate}>
            {t("create_room")}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
          {/* Pannel Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">{t("options")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timePerTurn">{t("time_per_turn")}</Label>
                <Select value={timePerTurn} onValueChange={setTimePerTurn}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("time_per_turn_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">{t("15_seconds")}</SelectItem>
                    <SelectItem value="30">{t("30_seconds")}</SelectItem>
                    <SelectItem value="60">{t("1_minute")}</SelectItem>
                    <SelectItem value="120">{t("2_minutes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whoPlayFirst">{t("who_plays_first")}</Label>
                <Select value={whoPlayFirst} onValueChange={setWhoPlayFirst}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("who_plays_first_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">{t("random")}</SelectItem>
                    <SelectItem value="host">{t("host")}</SelectItem>
                    <SelectItem value="guest">{t("guest")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placingTime">{t("ship_placing_time")}</Label>
                <Select value={placingTime} onValueChange={setPlacingTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("ship_placing_time_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">{t("1_minute")}</SelectItem>
                    <SelectItem value="120">{t("2_minutes")}</SelectItem>
                    <SelectItem value="180">{t("3_minutes")}</SelectItem>
                    <SelectItem value="300">{t("5_minutes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
    </Modal>
  );
}