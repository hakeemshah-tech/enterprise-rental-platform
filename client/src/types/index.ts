/**
 * ─── CLIENT/SERVER TYPE CONTRACT: SSOT ───────────────────────
 *
 * This file is the single source of truth for every shape that crosses
 * the network boundary. The Property API is plain JavaScript, so the
 * contract is *declared* here and *enforced* at three points:
 *
 *   1. Server: Zod schemas in `server/src/validations/*.validation.js`
 *      validate every inbound body before a controller runs.
 *   2. Server: Mongoose schemas in `server/src/models/*.js` define the
 *      persisted shape that controllers serialize back.
 *   3. Client: the interfaces below type every `api.*` response, and
 *      `ApiResponse<T>` matches the envelope every controller returns.
 *
 * Changing a field means changing all three. The counterpart files are:
 *
 *   User      ←→ server/src/models/User.js       + validations/auth.validation.js
 *   Property  ←→ server/src/models/Property.js   + validations/property.validation.js
 *   Booking   ←→ server/src/models/Booking.js    + validations/booking.validation.js
 *   Enquiry   ←→ server/src/models/Enquiry.js    + validations/enquiry.validation.js
 *
 * `client/src/lib/validations.ts` holds the browser-side Zod schemas for
 * form input; they mirror the server schemas above and must stay in sync.
 *
 * See the "Type Safety" section of the root README for the rationale and
 * the migration path to a generated, compile-time-verified contract.
 * ──────────────────────────────────────────────────────────────
 */

export interface User {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatar?: string;
    phone?: string;
}

export interface PropertyImage {
    url: string;
    alt?: string;
}

export interface Property {
    _id: string;
    title: string;
    slug: string;
    description: string;
    type: 'villa' | 'apartment' | 'cottage' | 'cabin' | 'penthouse' | 'beach-house';
    price: {
        perNight: number;
        cleaningFee: number;
        serviceFee: number;
    };
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        coordinates?: { lat: number; lng: number };
    };
    amenities: string[];
    images: PropertyImage[];
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    availability?: { startDate: string; endDate: string }[];
    featured: boolean;
    status: 'active' | 'inactive' | 'maintenance';
    rating: number;
    reviewCount: number;
    owner: { name: string; avatar: string } | string;
    externalLinks?:
        | { platformName: string; url: string }[]
        | {
              airbnb?: string;
              bookingCom?: string;
              agoda?: string;
          };
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    _id: string;
    property: Property | string;
    user: User | string;
    checkIn: string;
    checkOut: string;
    guests: { adults: number; children: number };
    totalPrice: number;
    nightlyRate: number;
    nights: number;
    cleaningFee: number;
    serviceFee: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
    paymentId?: string;
    specialRequests?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Enquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    property: Property | string | null;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'responded' | 'closed';
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    pagination?: PaginationInfo;
    errors?: { field: string; message: string }[];
}
