import { useState } from 'react';
import './ListingForm.css';

const emptyForm = {
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
};

// shared by Create Listing and Update Listing pages - keeps both forms identical
export default function ListingForm({ initialValues, onSubmit, submitLabel, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState(initialValues?.amenities || []);
  const [imageInput, setImageInput] = useState('');
  const [images, setImages] = useState(initialValues?.images || []);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addAmenity() {
    const value = amenityInput.trim();
    if (!value) return;
    setAmenities((prev) => [...prev, value]);
    setAmenityInput('');
  }

  function removeAmenity(index) {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  }

  function addImage() {
    const value = imageInput.trim();
    if (!value) return;
    setImages((prev) => [...prev, value]);
    setImageInput('');
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (!form.location.trim()) nextErrors.location = 'Location is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter a price greater than 0.';
    if (!form.bedrooms || Number(form.bedrooms) < 0) nextErrors.bedrooms = 'Enter a valid number of bedrooms.';
    if (!form.bathrooms || Number(form.bathrooms) < 0) nextErrors.bathrooms = 'Enter a valid number of bathrooms.';
    if (!form.guests || Number(form.guests) < 1) nextErrors.guests = 'Enter at least 1 guest.';
    if (images.length === 0) nextErrors.images = 'Add at least one image URL.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        guests: Number(form.guests),
        price: Number(form.price),
        weeklyDiscount: Number(form.weeklyDiscount) || 0,
        cleaningFee: Number(form.cleaningFee) || 0,
        serviceFee: Number(form.serviceFee) || 0,
        occupancyTaxes: Number(form.occupancyTaxes) || 0,
        amenities,
        images,
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit} noValidate>
      <div>
        <h1 className="listing-form__title">
          {submitLabel === 'Save' ? 'Create a New Listing' : 'Update Listing'}
        </h1>
        <p className="listing-form__subtitle">
          {submitLabel === 'Save'
            ? 'Fill in the details to publish your property.'
            : 'Edit the details below and save your changes.'}
        </p>
      </div>

      <div className="form-row">
        <label>
          Title
          <input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </label>

        <div className="beds-baths-type">
          <label>
            Beds
            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => updateField('bedrooms', e.target.value)}
            />
          </label>
          <label>
            Baths
            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => updateField('bathrooms', e.target.value)}
            />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
              <option>Entire apartment</option>
              <option>Entire house</option>
              <option>Private room</option>
              <option>Shared room</option>
            </select>
          </label>
        </div>
      </div>
      {(errors.bedrooms || errors.bathrooms) && (
        <span className="field-error">{errors.bedrooms || errors.bathrooms}</span>
      )}

      <div className="form-row">
        <label>
          Location
          <input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </label>

        <label>
          Price per night (R)
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </label>
      </div>

      <div className="form-row">
        <label>
          Guests
          <input
            type="number"
            min="1"
            value={form.guests}
            onChange={(e) => updateField('guests', e.target.value)}
          />
          {errors.guests && <span className="field-error">{errors.guests}</span>}
        </label>
      </div>

      <div className="form-row">
        <label className="add-field">
          Amenities
          <div className="add-row">
            <input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              placeholder="e.g. wifi"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <button type="button" className="btn btn-primary" onClick={addAmenity}>
              Add
            </button>
          </div>
          <div className="chip-list">
            {amenities.map((a, i) => (
              <span key={`${a}-${i}`} className="chip">
                {a}
                <button type="button" onClick={() => removeAmenity(i)} aria-label={`Remove ${a}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>

        <label className="add-field">
          Image URL
          <div className="add-row">
            <input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://…"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button type="button" className="btn btn-primary" onClick={addImage}>
              Add
            </button>
          </div>
          {errors.images && <span className="field-error">{errors.images}</span>}
          <div className="chip-list">
            {images.map((img, i) => (
              <span key={`${img}-${i}`} className="chip chip-image">
                Image {i + 1}
                <button type="button" onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>
      </div>

      <div className="form-row">
        <label>
          Weekly discount (%)
          <input
            type="number"
            min="0"
            value={form.weeklyDiscount}
            onChange={(e) => updateField('weeklyDiscount', e.target.value)}
          />
        </label>
        <label>
          Cleaning fee (R)
          <input
            type="number"
            min="0"
            value={form.cleaningFee}
            onChange={(e) => updateField('cleaningFee', e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Service fee (R)
          <input
            type="number"
            min="0"
            value={form.serviceFee}
            onChange={(e) => updateField('serviceFee', e.target.value)}
          />
        </label>
        <label>
          Occupancy taxes (R)
          <input
            type="number"
            min="0"
            value={form.occupancyTaxes}
            onChange={(e) => updateField('occupancyTaxes', e.target.value)}
          />
        </label>
      </div>

      <label className="description-field">
        Description
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      {submitError && <p className="form-submit-error">{submitError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
