"use client";

import { useMemo, useState } from "react";
import {
  HEIGHT_TIERS,
  PRESET_PHRASES,
  SIDE_SPECIALIST_FEE,
  calculateOrder,
  createEmptyItem,
  type InscriptionItem,
} from "@/lib/pricing";
import { StelePanel } from "@/components/StelePanel";

function formatUah(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function Calculator() {
  const [frontItems, setFrontItems] = useState<InscriptionItem[]>([
    createEmptyItem(),
  ]);
  const [backItems, setBackItems] = useState<InscriptionItem[]>([
    createEmptyItem(),
  ]);

  const order = useMemo(
    () => calculateOrder(frontItems, backItems),
    [frontItems, backItems],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">

      <section className="mb-6 overflow-x-auto border border-stone-300 bg-stone-50 p-3">
        <h2 className="mb-3 text-sm font-medium text-stone-800">
          Тариф за висотою букви
        </h2>
        <table className="w-full min-w-[320px] text-left text-sm text-stone-700">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-4 font-medium">Висота</th>
              <th className="pb-2 font-medium">Ціна за букву</th>
            </tr>
          </thead>
          <tbody>
            {HEIGHT_TIERS.map((t) => (
              <tr key={t.id} className="border-b border-stone-100 last:border-0">
                <td className="py-1.5 pr-4">{t.label}</td>
                <td className="py-1.5">{formatUah(t.pricePerLetter)} грн</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-stone-500">
          Готові фрази:{" "}
          {PRESET_PHRASES.map((p) => `«${p.text}» — ${p.price} грн`).join("; ")}
          . Сторона з написами: +{SIDE_SPECIALIST_FEE} грн.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <StelePanel
          title="Спереду стели"
          subtitle="Лицьова сторона"
          items={frontItems}
          onChange={setFrontItems}
          sideCost={order.front}
        />
        <StelePanel
          title="Ззаду стели"
          subtitle="Зворотна сторона"
          items={backItems}
          onChange={setBackItems}
          sideCost={order.back}
        />
      </div>

      <footer className="mt-6 border-2 border-stone-800 bg-stone-900 px-5 py-4 text-stone-50">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="text-stone-400">Піскоструй (база)</p>
            <p className="tabular-nums">
              Спереду: {formatUah(order.front.sandblast)} грн · Ззаду:{" "}
              {formatUah(order.back.sandblast)} грн
            </p>
            <p className="font-medium tabular-nums">
              Разом піскоструй: {formatUah(order.sandblastTotal)} грн
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-stone-400">Робота по сторонах</p>
            <p className="tabular-nums">
              {order.sidesWithWork} × {SIDE_SPECIALIST_FEE} грн ={" "}
              {formatUah(order.specialistFeeTotal)} грн
            </p>
            <p className="text-xs text-stone-500">
              Спереду:{" "}
              {order.front.specialistFee > 0
                ? `+${formatUah(order.front.specialistFee)}`
                : "0"}{" "}
              · Ззаду:{" "}
              {order.back.specialistFee > 0
                ? `+${formatUah(order.back.specialistFee)}`
                : "0"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-stone-700 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-stone-400">Піскоструй + робота</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatUah(order.subtotal)}{" "}
              <span className="text-base font-normal">грн</span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-stone-400">У пам&apos;ятник (×3)</p>
            <p className="text-3xl font-semibold tabular-nums text-white">
              {formatUah(order.monumentPrice)}{" "}
              <span className="text-lg font-normal">грн</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
