import { supabase } from "@/supabase";
import { MembershipFee } from "@/types";

export type { MembershipFee };

const COLUMNS = "id, name, description, price, benefits";

class MembershipRepository {
  async fetchFees(): Promise<MembershipFee[]> {
    const { data, error } = await supabase
      .from("membership_fees")
      .select(COLUMNS)
      .order("price", { ascending: true });

    if (error) {
      console.error("Failed to fetch membership fees:", error.message);
      return [];
    }

    return data ?? [];
  }

  async postFee(fee: Omit<MembershipFee, "id">): Promise<MembershipFee> {
    const { data, error } = await supabase
      .from("membership_fees")
      .insert({
        name: fee.name,
        description: fee.description,
        price: fee.price,
        benefits: fee.benefits,
      })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (error) throw error;
      throw new Error("Kon het lidgeld niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateFee(id: number, fee: Omit<MembershipFee, "id">): Promise<MembershipFee> {
    const { data, error } = await supabase
      .from("membership_fees")
      .update({
        name: fee.name,
        description: fee.description,
        price: fee.price,
        benefits: fee.benefits,
      })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (error) throw error;
      throw new Error("Kon het lidgeld niet bijwerken, probeer opnieuw.");
    }

    return data;
  }

  async deleteFee(id: number): Promise<void> {
    const { error } = await supabase.from("membership_fees").delete().eq("id", id);
    if (error) throw error;
  }
}

export { MembershipRepository };
