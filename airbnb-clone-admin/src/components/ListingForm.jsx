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

    <h1 className="lf-page-title">
      {isEdit ? 'Update Listing' : 'Create Listing'}
    </h1>

    <div className="lf-grid">

      {/* Listing name */}
      <div className="lf-field lf-listing-name">
        <label className="lf-label" htmlFor="lf-title">
          Listing Name
        </label>

        <input
          id="lf-title"
          className={`lf-input${errors.title ? ' lf-input--error' : ''}`}
          type="text"
          placeholder="Enter listing name"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />

        {errors.title && (
          <p className="lf-error">{errors.title}</p>
        )}
      </div>

      {/* Rooms */}
      <div className="lf-field lf-rooms">
        <label className="lf-label" htmlFor="lf-bedrooms">
          Rooms
        </label>

        <input
          id="lf-bedrooms"
          className={`lf-input${errors.bedrooms ? ' lf-input--error' : ''}`}
          type="number"
          min="0"
          value={form.bedrooms}
          onChange={(e) => set('bedrooms', e.target.value)}
        />

        {errors.bedrooms && (
          <p className="lf-error">{errors.bedrooms}</p>
        )}
      </div>

      {/* Baths */}
      <div className="lf-field lf-baths">
        <label className="lf-label" htmlFor="lf-bathrooms">
          Baths
        </label>

        <input
          id="lf-bathrooms"
          className={`lf-input${errors.bathrooms ? ' lf-input--error' : ''}`}
          type="number"
          min="0"
          value={form.bathrooms}
          onChange={(e) => set('bathrooms', e.target.value)}
        />

        {errors.bathrooms && (
          <p className="lf-error">{errors.bathrooms}</p>
        )}
      </div>

      {/* Type */}
      <div className="lf-field lf-type">
        <label className="lf-label" htmlFor="lf-type">
          Type
        </label>

        <select
          id="lf-type"
          className="lf-input lf-select"
          value={form.type}
          onChange={(e) => set('type', e.target.value)}
        >
          {ACCOMMODATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="lf-field lf-location">
        <label className="lf-label" htmlFor="lf-location">
          Location
        </label>

        <input
          id="lf-location"
          className={`lf-input${errors.location ? ' lf-input--error' : ''}`}
          type="text"
          placeholder="Enter location (e.g. Cape Town, SA)"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
        />

        {errors.location && (
          <p className="lf-error">{errors.location}</p>
        )}
      </div>

      {/* Guests */}
      <div className="lf-field lf-guests">
        <label className="lf-label" htmlFor="lf-guests">
          Max Guests
        </label>

        <input
          id="lf-guests"
          className={`lf-input${errors.guests ? ' lf-input--error' : ''}`}
          type="number"
          min="1"
          value={form.guests}
          onChange={(e) => set('guests', e.target.value)}
        />

        {errors.guests && (
          <p className="lf-error">{errors.guests}</p>
        )}
      </div>

      {/* Price */}
      <div className="lf-field lf-price">
        <label className="lf-label" htmlFor="lf-price">
          Price per Night
        </label>

        <div className="lf-price-wrap">
          <span className="lf-price-prefix">R</span>

          <input
            id="lf-price"
            className={`lf-input lf-input--price${
              errors.price ? ' lf-input--error' : ''
            }`}
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </div>

        {errors.price && (
          <p className="lf-error">{errors.price}</p>
        )}
      </div>

      {/* Description */}
      <div className="lf-field lf-description">
        <label className="lf-label" htmlFor="lf-desc">
          Description
        </label>

        <textarea
          id="lf-desc"
          className={`lf-input lf-textarea${
            errors.description ? ' lf-input--error' : ''
          }`}
          rows={6}
          placeholder="Enter a detailed description of your place"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        {errors.description && (
          <p className="lf-error">{errors.description}</p>
        )}
      </div>

      {/* Amenities */}
      <div className="lf-field lf-amenities">
        <label className="lf-label" htmlFor="lf-amenity">
          Amenities
        </label>

        <div className="lf-amenity-row">
          <input
            id="lf-amenity"
            className="lf-input"
            type="text"
            placeholder="Enter amenity"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity();
              }
            }}
          />

          <button
            type="button"
            className="btn btn-accent lf-add-button"
            onClick={addAmenity}
          >
            Add
          </button>
        </div>

        {amenities.length > 0 && (
          <div className="lf-chips">
            {amenities.map((amenity, index) => (
              <span key={index} className="lf-chip">
                {amenity}

                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  aria-label={`Remove ${amenity}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div className="lf-field lf-images">
        <div className="lf-images-header">
          <label className="lf-label">
            Images
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="lf-file-input"
            onChange={handleFilesSelected}
          />

          <button
            type="button"
            className="btn btn-accent lf-upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Images
          </button>
        </div>

        <div
          className="lf-upload-area"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <svg
            className="lf-upload-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <strong>Drag & drop images here</strong>
          <span>or click to browse</span>
        </div>

        <div className="lf-image-url-row">
          <input
            className="lf-input"
            type="url"
            placeholder="Or paste an image URL"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
          />

          <button
            type="button"
            className="btn btn-accent"
            onClick={addImage}
          >
            Add
          </button>
        </div>

        {errors.images && (
          <p className="lf-error">{errors.images}</p>
        )}

        {photos.length > 0 && (
          <div className="lf-photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="lf-photo-thumb">

                <img
                  src={
                    photo.kind === 'file'
                      ? photo.previewUrl
                      : resolveImageUrl(photo.value)
                  }
                  alt={`Photo ${index + 1}`}
                />

                {index === 0 && (
                  <span className="lf-photo-cover">
                    Cover
                  </span>
                )}

                {photo.kind === 'file' && (
                  <span className="lf-photo-uploading">
                    Will upload
                  </span>
                )}

                <button
                  type="button"
                  className="lf-photo-remove"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra pricing */}
      <div className="lf-extra-pricing">

        <div className="lf-field">
          <label className="lf-label">
            Weekly Discount %
          </label>

          <input
            className="lf-input"
            type="number"
            min="0"
            max="100"
            value={form.weeklyDiscount}
            onChange={(e) =>
              set('weeklyDiscount', e.target.value)
            }
          />
        </div>

        <div className="lf-field">
          <label className="lf-label">
            Cleaning Fee
          </label>

          <input
            className="lf-input"
            type="number"
            min="0"
            value={form.cleaningFee}
            onChange={(e) =>
              set('cleaningFee', e.target.value)
            }
          />
        </div>

        <div className="lf-field">
          <label className="lf-label">
            Service Fee
          </label>

          <input
            className="lf-input"
            type="number"
            min="0"
            value={form.serviceFee}
            onChange={(e) =>
              set('serviceFee', e.target.value)
            }
          />
        </div>

        <div className="lf-field">
          <label className="lf-label">
            Occupancy Taxes
          </label>

          <input
            className="lf-input"
            type="number"
            min="0"
            value={form.occupancyTaxes}
            onChange={(e) =>
              set('occupancyTaxes', e.target.value)
            }
          />
        </div>

      </div>

      {/* Booking options */}
      <div className="lf-policies">

        <label className="lf-checkbox">
          <input
            type="checkbox"
            checked={!!form.freeCancellation}
            onChange={(e) =>
              set('freeCancellation', e.target.checked)
            }
          />
          Free cancellation
        </label>

        <label className="lf-checkbox">
          <input
            type="checkbox"
            checked={!!form.instantBook}
            onChange={(e) =>
              set('instantBook', e.target.checked)
            }
          />
          Instant Book
        </label>

      </div>

      {submitError && (
        <div className="lf-submit-error" role="alert">
          ⚠ {submitError}
        </div>
      )}

      {/* Buttons */}
      <div className="lf-actions">

        <button
          type="submit"
          className="btn btn-primary lf-actions__submit"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Create'}
        </button>

        <button
          type="button"
          className="btn lf-actions__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>

      </div>

    </div>
  </form>
)}