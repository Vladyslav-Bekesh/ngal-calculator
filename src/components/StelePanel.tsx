"use client";

import {
  HEIGHT_TIERS,
  PRESET_PHRASES,
  calculateLine,
  createEmptyItem,
  type InscriptionItem,
  type InscriptionKind,
  type SideCostBreakdown,
} from "@/lib/pricing";
import { DATE_MASK_EMPTY, buildMaskedDate, extractDateDigits } from "@/lib/dateMask";
import { DateMaskedInput } from "@/components/DateMaskedInput";

function formatUah(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

const fieldClass =
  "w-full border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 placeholder:text-stone-500 scheme-light";

type StelePanelProps = {
  title: string;
  subtitle: string;
  items: InscriptionItem[];
  onChange: (items: InscriptionItem[]) => void;
  sideCost: SideCostBreakdown;
};

export function StelePanel({
  title,
  subtitle,
  items,
  onChange,
  sideCost,
}: StelePanelProps) {
  const updateItem = (id: string, patch: Partial<InscriptionItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const setKind = (id: string, kind: InscriptionKind) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next: Partial<InscriptionItem> = { kind };
    if (kind === "preset" && !item.presetId) {
      next.presetId = PRESET_PHRASES[0].id;
      next.text = PRESET_PHRASES[0].text;
    }
    if (kind === "text") {
      next.text = item.kind === "preset" ? "" : item.text;
    }
    if (kind === "date") {
      const d = item.kind === "date" ? extractDateDigits(item.text) : "";
      next.text =
        item.kind === "preset" ? DATE_MASK_EMPTY : buildMaskedDate(d);
    }
    updateItem(id, next);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      onChange([createEmptyItem()]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createEmptyItem()]);
  };

  return (
    <section className="flex flex-col border border-stone-300 bg-white">
      <div className="border-b border-stone-200 bg-stone-100 px-3 py-2">
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {items.map((item, index) => {
          const breakdown = calculateLine(item);
          return (
            <article
              key={item.id}
              className="border border-stone-200 bg-stone-50/80 p-2"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-stone-600">
                  Рядок {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {(
                    [
                      ["text", "Текст"],
                      ["preset", "Фраза"],
                      ["date", "Дата"],
                    ] as const
                  ).map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setKind(item.id, kind)}
                      className={`px-2 py-0.5 text-xs font-medium ${
                        item.kind === kind
                          ? "bg-stone-800 text-white"
                          : "bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {item.kind === "preset" && (
                <select
                  className={`${fieldClass} mb-1`}
                  value={item.presetId}
                  onChange={(e) => {
                    const preset = PRESET_PHRASES.find(
                      (p) => p.id === e.target.value,
                    );
                    updateItem(item.id, {
                      presetId: e.target.value as InscriptionItem["presetId"],
                      text: preset?.text ?? "",
                    });
                  }}
                >
                  {PRESET_PHRASES.map((p) => (
                    <option key={p.id} value={p.id} className="text-stone-900">
                      {p.text} — {p.price} грн
                    </option>
                  ))}
                </select>
              )}

              {item.kind === "text" && (
                <div className="grid gap-1 sm:grid-cols-[1fr_minmax(11rem,14rem)]">
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Текст напису"
                    value={item.text}
                    onChange={(e) =>
                      updateItem(item.id, { text: e.target.value })
                    }
                  />
                  <select
                    className={fieldClass}
                    value={item.heightTierId}
                    onChange={(e) =>
                      updateItem(item.id, {
                        heightTierId:
                          e.target.value as InscriptionItem["heightTierId"],
                      })
                    }
                    aria-label="Висота букви"
                  >
                    {HEIGHT_TIERS.map((t) => (
                      <option key={t.id} value={t.id} className="text-stone-900">
                        {t.label} — {formatUah(t.pricePerLetter)} грн
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {item.kind === "date" && (
                <DateMaskedInput
                  className={`${fieldClass} mb-0.5 font-mono tracking-wide`}
                  value={item.text || DATE_MASK_EMPTY}
                  onChange={(masked) => updateItem(item.id, { text: masked })}
                />
              )}

              <div className="mt-1.5 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t border-stone-200 pt-1.5">
                <p className="min-w-0 flex-1 text-xs text-stone-600">
                  {breakdown.detail}
                </p>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <p className="text-sm font-semibold tabular-nums text-stone-900">
                    {formatUah(breakdown.amount)} грн
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-700 hover:text-red-900"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="w-full border border-dashed border-stone-400 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          + Додати рядок
        </button>
      </div>

      <div className="border-t border-stone-200 px-3 py-2 text-right text-sm text-stone-600">
        <p>
          Піскоструй:{" "}
          <span className="font-medium tabular-nums text-stone-900">
            {formatUah(sideCost.sandblast)} грн
          </span>
          {sideCost.specialistFee > 0 && (
            <>
              {" "}
              + робота{" "}
              <span className="font-medium tabular-nums text-stone-900">
                {formatUah(sideCost.specialistFee)} грн
              </span>
            </>
          )}
        </p>
        <p className="mt-0.5">
          <span className="text-stone-600">Разом за сторону: </span>
          <span className="text-lg font-semibold tabular-nums text-stone-900">
            {formatUah(sideCost.total)} грн
          </span>
        </p>
      </div>
    </section>
  );
}
