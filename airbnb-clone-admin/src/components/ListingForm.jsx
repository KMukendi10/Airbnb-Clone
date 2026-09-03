/**
 * ListingForm – shared form used by both CreateListing and UpdateListing.
 *
 * Sections (visually separated):
 *   1. Basic Info    – title, type, location
 *   2. Capacity      – bedrooms, bathrooms, guests
 *   3. Pricing       – price/night, weekly discount, cleaning fee, service fee, occupancy taxes
 *   4. Media         – image URLs (chip tags)
 *   5. Amenities     – amenity chips
 *   6. Description   – textarea
 */

import { useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '../api/client';
import './ListingForm.css';

const EMPTY_FORM = {
  title: '',
  location: '',
  type: 'Entire apartment',
  bedrooms: 1,
  bathrooms: 1,
  guests: 1,
  price: '',
  description: '',
  weeklyDiscount: 0,
  cleaningFee: 0,
  serviceFee: 0,
  occupancyTaxes: 0,
  freeCancellation: false,
  instantBook: false,
};

const ACCOMMODATION_TYPES = [
  'Entire apartment',
  'Entire house',
  'Entire studio',
  'Private room',
  'Shared room',
];

export default function ListingForm({ initialValues, onSubmit, submitLabel, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState(initialValues?.amenities ?? []);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Photos ──────────────────────────────────────────────
  // Each photo is either { kind: 'url', value } (an existing/pasted image URL)
  // or { kind: 'file', file, previewUrl } (a file picked from the device,
  // uploaded via multipart/form-data on submit and stored on disk server-side).
  const [imageInput, setImageInput] = useState('');
  const [photos, setPhotos] = useState(
    (initialValues?.images ?? []).map((value) => ({ kind: 'url', value }))
  );
  const fileInputRef = useRef(null);

  // Keep a ref in sync with the latest photos so the unmount cleanup below
  // (which only runs once) can still see whatever was picked during the session.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Revoke object URLs for any locally-picked files when the form unmounts,
  // so we don't leak memory.
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => {
        if (p.kind === 'file' && p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear individual field error on change
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  /* ── Amenities ── */
  function addAmenity() {
    const v = amenityInput.trim();
    if (!v || amenities.includes(v)) return;
    setAmenities((prev) => [...prev, v]);
    setAmenityInput('');
  }

  function removeAmenity(i) {
    setAmenities((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* ── Photos: add by URL ── */
  function addImage() {
    const v = imageInput.trim();
    if (!v) return;
    setPhotos((prev) => [...prev, { kind: 'url', value: v }]);
    setImageInput('');
    if (errors.images) setErrors((e) => ({ ...e, images: undefined }));
  }

  /* ── Photos: upload from device ── */
  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const next = files.map((file) => ({
      kind: 'file',
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...next]);
    if (errors.images) setErrors((e) => ({ ...e, images: undefined }));

    // Reset the input so selecting the same file again still fires onChange
    e.target.value = '';
  }

  function removeImage(i) {
    setPhotos((prev) => {
      const target = prev[i];
      if (target?.kind === 'file' && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== i);
    });
  }

  /* ── Validation ── */
  function validate() {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required.';
    if (!form.location.trim())    e.location     = 'Location is required.';
    if (!form.description.trim()) e.description  = 'Description is required.';
    if (!form.price || Number(form.price) <= 0)
                                  e.price        = 'Enter a price greater than 0.';
    if (Number(form.bedrooms) < 0) e.bedrooms    = 'Cannot be negative.';
    if (Number(form.bathrooms) < 0) e.bathrooms  = 'Cannot be negative.';
    if (Number(form.guests) < 1)   e.guests      = 'At least 1 guest.';
    if (photos.length === 0)       e.images      = 'Add at least one photo (upload or URL).';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const fields = {
      title: form.title,
      location: form.location,
      type: form.type,
      description: form.description,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      guests: Number(form.guests),
      price: Number(form.price),
      weeklyDiscount: Number(form.weeklyDiscount) || 0,
      cleaningFee: Number(form.cleaningFee) || 0,
      serviceFee: Number(form.serviceFee) || 0,
      occupancyTaxes: Number(form.occupancyTaxes) || 0,
      freeCancellation: !!form.freeCancellation,
      instantBook: !!form.instantBook,
    };

    const existingImages = photos.filter((p) => p.kind === 'url').map((p) => p.value);
    const filesToUpload = photos.filter((p) => p.kind === 'file').map((p) => p.file);

    setSubmitting(true);
    try {
      if (filesToUpload.length > 0) {
        // Real file upload: send multipart/form-data so Multer on the
        // backend can write the files to disk and return their URLs.
        const fd = new FormData();
        Object.entries(fields).forEach(([key, value]) => fd.append(key, value));
        amenities.forEach((a) => fd.append('amenities', a));
        fd.append('existingImages', JSON.stringify(existingImages));
        filesToUpload.forEach((file) => fd.append('images', file));

        await onSubmit(fd);
      } else {
        // No new files picked — plain JSON is simpler and avoids an
        // unnecessary multipart request when photos are all URLs.
        await onSubmit({
          ...fields,
          amenities,
          images: existingImages,
        });
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = submitLabel !== 'Publish Listing';

  return (
    <form className="lf-form" onSubmit={handleSubmit} noValidate>

      {/* ── Form header ── */}
      <div className="lf-header">
        
        <div>
          <h1 className="lf-header__title">
            {isEdit ? 'Update Listing' : 'Create a New Listing'}
          </h1>
          <p className="lf-header__subtitle">
            {isEdit
              ? 'Edit the details below and save your changes.'
              : 'Fill in all sections below to publish your property.'}
          </p>
        </div>
      </div>

      {/* ════════════════════════════
          SECTION 1 – Basic Info
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">1</span>
          Basic Info
        </h2>

        {/* Title – full width */}
        <div className="lf-field lf-field--full">
          <label className="lf-label" htmlFor="lf-title">Property title</label>
          <input
            id="lf-title"
            className={`lf-input${errors.title ? ' lf-input--error' : ''}`}
            type="text"
            placeholder="e.g. Modern Apartment in Cape Town"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
          {errors.title && <p className="lf-error">{errors.title}</p>}
        </div>

        {/* Type + Location – 2 cols */}
        <div className="lf-row">
          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-type">Property type</label>
            <select
              id="lf-type"
              className="lf-input lf-select"
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              {ACCOMMODATION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-location">Location / City</label>
            <input
              id="lf-location"
              className={`lf-input${errors.location ? ' lf-input--error' : ''}`}
              type="text"
              placeholder="e.g. Cape Town"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
            {errors.location && <p className="lf-error">{errors.location}</p>}
          </div>
        </div>

        {/* Booking policies — power the guest-facing filter pills */}
        <div className="lf-row lf-checkbox-row">
          <label className="lf-checkbox">
            <input
              type="checkbox"
              checked={!!form.freeCancellation}
              onChange={(e) => set('freeCancellation', e.target.checked)}
            />
            Free cancellation
          </label>
          <label className="lf-checkbox">
            <input
              type="checkbox"
              checked={!!form.instantBook}
              onChange={(e) => set('instantBook', e.target.checked)}
            />
            Instant Book
          </label>
        </div>
      </section>

      {/* ════════════════════════════
          SECTION 2 – Capacity
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">2</span>
          Capacity
        </h2>

        <div className="lf-row lf-row--3">
          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-bedrooms">Bedrooms</label>
            <input
              id="lf-bedrooms"
              className={`lf-input${errors.bedrooms ? ' lf-input--error' : ''}`}
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => set('bedrooms', e.target.value)}
            />
            {errors.bedrooms && <p className="lf-error">{errors.bedrooms}</p>}
          </div>

          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-bathrooms">Bathrooms</label>
            <input
              id="lf-bathrooms"
              className={`lf-input${errors.bathrooms ? ' lf-input--error' : ''}`}
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => set('bathrooms', e.target.value)}
            />
            {errors.bathrooms && <p className="lf-error">{errors.bathrooms}</p>}
          </div>

          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-guests">Max guests</label>
            <input
              id="lf-guests"
              className={`lf-input${errors.guests ? ' lf-input--error' : ''}`}
              type="number"
              min="1"
              value={form.guests}
              onChange={(e) => set('guests', e.target.value)}
            />
            {errors.guests && <p className="lf-error">{errors.guests}</p>}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          SECTION 3 – Pricing
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">3</span>
          Pricing
        </h2>

        {/* Price – highlighted */}
        <div className="lf-field lf-field--price">
          <label className="lf-label" htmlFor="lf-price">
            Price per night
            <span className="lf-label-hint">ZAR (R)</span>
          </label>
          <div className="lf-price-wrap">
            <span className="lf-price-prefix" aria-hidden="true">R</span>
            <input
              id="lf-price"
              className={`lf-input lf-input--price${errors.price ? ' lf-input--error' : ''}`}
              type="number"
              min="0"
              placeholder="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>
          {errors.price && <p className="lf-error">{errors.price}</p>}
        </div>

        <div className="lf-row lf-row--3">
          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-discount">
              Weekly discount
              <span className="lf-label-hint">%</span>
            </label>
            <input
              id="lf-discount"
              className="lf-input"
              type="number"
              min="0"
              max="100"
              value={form.weeklyDiscount}
              onChange={(e) => set('weeklyDiscount', e.target.value)}
            />
          </div>

          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-cleaning">
              Cleaning fee
              <span className="lf-label-hint">R</span>
            </label>
            <input
              id="lf-cleaning"
              className="lf-input"
              type="number"
              min="0"
              value={form.cleaningFee}
              onChange={(e) => set('cleaningFee', e.target.value)}
            />
          </div>

          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-service">
              Service fee
              <span className="lf-label-hint">R</span>
            </label>
            <input
              id="lf-service"
              className="lf-input"
              type="number"
              min="0"
              value={form.serviceFee}
              onChange={(e) => set('serviceFee', e.target.value)}
            />
          </div>
        </div>

        <div className="lf-row" style={{ maxWidth: '340px' }}>
          <div className="lf-field">
            <label className="lf-label" htmlFor="lf-taxes">
              Occupancy taxes
              <span className="lf-label-hint">R</span>
            </label>
            <input
              id="lf-taxes"
              className="lf-input"
              type="number"
              min="0"
              value={form.occupancyTaxes}
              onChange={(e) => set('occupancyTaxes', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════
          SECTION 4 – Photos
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">4</span>
          Photos
        </h2>
        <p className="lf-section__desc">
          Upload photos from your device, or add an image URL. The first photo will be the cover photo.
        </p>

        {/* Upload from device */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple
          className="lf-file-input"
          onChange={handleFilesSelected}
          aria-label="Upload photos from your device"
        />
        <button
          type="button"
          className="lf-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="lf-upload-btn__icon">
            <path
              d="M12 3a1 1 0 0 1 1 1v10.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1zM5 18a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"
              fill="currentColor"
            />
          </svg>
          Upload photos from device
        </button>

        <p className="lf-or-divider">or add by URL</p>

        {/* Or add by URL */}
        <div className="lf-chip-add">
          <input
            className="lf-input"
            type="url"
            placeholder="https://images.unsplash.com/…"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            aria-label="Image URL"
          />
          <button type="button" className="btn btn-accent btn-sm" onClick={addImage}>
            Add photo
          </button>
        </div>
        {errors.images && <p className="lf-error">{errors.images}</p>}

        {photos.length > 0 && (
          <div className="lf-photo-grid">
            {photos.map((p, i) => (
              <div key={i} className="lf-photo-thumb">
                <img
                  src={p.kind === 'file' ? p.previewUrl : resolveImageUrl(p.value)}
                  alt={`Photo ${i + 1}`}
                  loading="lazy"
                />
                {i === 0 && <span className="lf-photo-cover">Cover</span>}
                {p.kind === 'file' && <span className="lf-photo-uploading">Will upload</span>}
                <button
                  type="button"
                  className="lf-photo-remove"
                  onClick={() => removeImage(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════
          SECTION 5 – Amenities
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">5</span>
          Amenities
        </h2>
        <p className="lf-section__desc">
          List the features your property offers (e.g. Wifi, Pool, Kitchen).
        </p>

        <div className="lf-chip-add">
          <input
            className="lf-input"
            type="text"
            placeholder="e.g. Wifi"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
            aria-label="Amenity name"
          />
          <button type="button" className="btn btn-accent btn-sm" onClick={addAmenity}>
            Add
          </button>
        </div>

        {amenities.length > 0 && (
          <div className="lf-chips">
            {amenities.map((a, i) => (
              <span key={i} className="lf-chip">
                {a}
                <button
                  type="button"
                  onClick={() => removeAmenity(i)}
                  aria-label={`Remove ${a}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════
          SECTION 6 – Description
      ════════════════════════════ */}
      <section className="lf-section">
        <h2 className="lf-section__title">
          <span className="lf-section__num">6</span>
          Description
        </h2>

        <div className="lf-field lf-field--full">
          <label className="lf-label" htmlFor="lf-desc">
            Tell guests about your place
          </label>
          <textarea
            id="lf-desc"
            className={`lf-input lf-textarea${errors.description ? ' lf-input--error' : ''}`}
            rows={6}
            placeholder="Describe the space, neighbourhood and what makes your listing special…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          {errors.description && <p className="lf-error">{errors.description}</p>}
        </div>
      </section>

      {/* ── Submit error banner ── */}
      {submitError && (
        <div className="lf-submit-error" role="alert">
          ⚠ {submitError}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="lf-actions">
        <button
          type="submit"
          className="btn btn-primary lf-actions__submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          className="btn btn-outline lf-actions__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
