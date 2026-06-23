import { useState } from 'react';
import { ChevronDown, ChevronUp, Percent, Building2, CreditCard, Gift, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATIC_OFFERS } from '../../config/marketingCampaigns';
import { formatDiscountLabel } from '../../utils/promotionUtils';
import { Button } from '../ui/Button';

function OfferRow({ icon: Icon, title, subtitle, badge, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 min-h-[56px]"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
            {badge && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
      </button>
      {open && subtitle && (
        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function ProductOffersPanel({ coupons = [], productPrice, vendorName }) {
  const [expanded, setExpanded] = useState(true);

  const applicable = coupons.filter((c) => {
    if (!c.minOrderAmount) return true;
    return Number(productPrice) >= Number(c.minOrderAmount);
  }).slice(0, 4);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
      <div className={`flex items-center justify-between gap-3 ${expanded ? 'mb-4' : ''}`}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Percent className="w-5 h-5 text-indigo-500" />
          Available Offers
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 min-h-[44px]"
            aria-expanded={expanded}
            aria-controls="product-offers-panel"
          >
            {expanded ? (
              <>
                Collapse <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show offers <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          <Link to="/offers" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:inline">
            View all
          </Link>
        </div>
      </div>

      {expanded && (
      <div id="product-offers-panel">
      <div className="space-y-3">
        {applicable.map((coupon) => (
          <OfferRow
            key={coupon.id}
            icon={Percent}
            title={`${formatDiscountLabel(coupon)} with ${coupon.code}`}
            subtitle={coupon.description}
            badge={coupon.badge}
            defaultOpen={false}
          />
        ))}

        {vendorName && (
          <OfferRow
            icon={Building2}
            title={`${vendorName} Store Offer`}
            subtitle="Extra savings on select items from this seller."
            badge="Vendor"
          />
        )}

        {STATIC_OFFERS.bank.map((o) => (
          <OfferRow key={o.id} icon={CreditCard} title={o.title} subtitle={o.subtitle} badge={o.badge} />
        ))}

        {STATIC_OFFERS.cashback.map((o) => (
          <OfferRow key={o.id} icon={Gift} title={o.title} subtitle={o.subtitle} badge={o.badge} />
        ))}

        {STATIC_OFFERS.bundle.map((o) => (
          <OfferRow key={o.id} icon={Package} title={o.title} subtitle={o.subtitle} badge={o.badge} />
        ))}
      </div>

      <Link to="/offers" className="block mt-4">
        <Button variant="outline" className="w-full min-h-[44px]">Explore All Coupons</Button>
      </Link>
      </div>
      )}
    </section>
  );
}
