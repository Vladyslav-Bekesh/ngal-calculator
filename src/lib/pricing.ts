export const HEIGHT_TIERS = [
  { id: "1-2", label: "1–2 см", pricePerLetter: 5 },
  { id: "2-2.5", label: "2–2,5 см", pricePerLetter: 7.5 },
  { id: "2.5-3", label: "2,5–3 см", pricePerLetter: 12.6 },
  { id: "3-5", label: "3–5 см", pricePerLetter: 16 },
  { id: "5-8", label: "5–8 см", pricePerLetter: 19.5 },
] as const;

export type HeightTierId = (typeof HEIGHT_TIERS)[number]["id"];

export const PRESET_PHRASES = [
  { id: "eternal-memory", text: "Вічна пам'ять", price: 150 },
  {
    id: "remember-love",
    text: "Пам'ятаємо, любимо, сумуємо",
    price: 230,
  },
] as const;

export type PresetPhraseId = (typeof PRESET_PHRASES)[number]["id"];

export const DATE_DIGIT_PRICE = 12;
/** Доплата за підготовку сторони (інший спеціаліст), якщо на стороні є написи. */
export const SIDE_SPECIALIST_FEE = 50;
export const MONUMENT_PRICE_MULTIPLIER = 3;

export type InscriptionKind = "text" | "preset" | "date";

export type InscriptionItem = {
  id: string;
  kind: InscriptionKind;
  text: string;
  heightTierId: HeightTierId;
  presetId: PresetPhraseId | "";
};

export function countLetters(text: string): number {
  const matches = text.match(/\p{L}/gu);
  return matches?.length ?? 0;
}

export function countDateDigits(text: string): number {
  const matches = text.match(/\d/g);
  return matches?.length ?? 0;
}

export function getHeightTier(id: HeightTierId) {
  const tier = HEIGHT_TIERS.find((t) => t.id === id);
  return tier ?? HEIGHT_TIERS[2];
}

export type LineBreakdown = {
  label: string;
  detail: string;
  amount: number;
};

export function calculateLine(item: InscriptionItem): LineBreakdown {
  if (item.kind === "preset") {
    const preset = PRESET_PHRASES.find((p) => p.id === item.presetId);
    if (!preset) {
      return { label: "Готова фраза", detail: "Оберіть фразу", amount: 0 };
    }
    return {
      label: preset.text,
      detail: `${preset.price} грн (фіксована ціна)`,
      amount: preset.price,
    };
  }

  if (item.kind === "date") {
    const digits = countDateDigits(item.text);
    const amount = digits * DATE_DIGIT_PRICE;
    return {
      label: "Дата",
      detail:
        digits > 0
          ? `«${item.text}»: ${digits} цифр × ${DATE_DIGIT_PRICE}`
          : "Введіть дату",
      amount,
    };
  }

  const letters = countLetters(item.text);
  const tier = getHeightTier(item.heightTierId);
  const amount = letters * tier.pricePerLetter;
  const preview =
    item.text.trim().slice(0, 40) + (item.text.trim().length > 40 ? "…" : "");

  return {
    label: item.text.trim() || "Текст",
    detail:
      letters > 0
        ? `«${preview || "…"}»: ${letters} букв × ${tier.pricePerLetter} грн (${tier.label})`
        : "Введіть текст",
    amount,
  };
}

export function sumItems(items: InscriptionItem[]): number {
  return items.reduce((sum, item) => sum + calculateLine(item).amount, 0);
}

export function sideHasInscriptions(items: InscriptionItem[]): boolean {
  return items.some((item) => calculateLine(item).amount > 0);
}

export type SideCostBreakdown = {
  sandblast: number;
  specialistFee: number;
  total: number;
};

export function calculateSideCost(items: InscriptionItem[]): SideCostBreakdown {
  const sandblast = sumItems(items);
  const specialistFee = sideHasInscriptions(items) ? SIDE_SPECIALIST_FEE : 0;
  return {
    sandblast,
    specialistFee,
    total: sandblast + specialistFee,
  };
}

export type OrderCostBreakdown = {
  front: SideCostBreakdown;
  back: SideCostBreakdown;
  sandblastTotal: number;
  specialistFeeTotal: number;
  sidesWithWork: number;
  subtotal: number;
  monumentPrice: number;
};

export function calculateOrder(
  frontItems: InscriptionItem[],
  backItems: InscriptionItem[],
): OrderCostBreakdown {
  const front = calculateSideCost(frontItems);
  const back = calculateSideCost(backItems);
  const sandblastTotal = front.sandblast + back.sandblast;
  const specialistFeeTotal = front.specialistFee + back.specialistFee;
  const sidesWithWork =
    (front.specialistFee > 0 ? 1 : 0) + (back.specialistFee > 0 ? 1 : 0);
  const subtotal = sandblastTotal + specialistFeeTotal;

  return {
    front,
    back,
    sandblastTotal,
    specialistFeeTotal,
    sidesWithWork,
    subtotal,
    monumentPrice: subtotal * MONUMENT_PRICE_MULTIPLIER,
  };
}

let itemIdSeq = 0;

export function newItemId(): string {
  itemIdSeq += 1;
  return `insc-${itemIdSeq}`;
}

export function createEmptyItem(): InscriptionItem {
  return {
    id: newItemId(),
    kind: "text",
    text: "",
    heightTierId: "2.5-3",
    presetId: "",
  };
}
