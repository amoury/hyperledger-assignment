/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Create a new property
 * @param {org.property.registration.createProperty} tx
 * @transaction
 */

async function createProperty(tx) {
  console.log('Property Creation Transaction');
  const factory = getFactory();
  const NS = 'org.property.registration';
  const me = getCurrentParticipant();

  //Add new property
  const property = factory.newResource(NS, 'Property', tx.PID);
  property.marketPrice = tx.marketPrice;
  property.regDate = tx.regDate;
  property.propertyType = tx.propertyType;
  property.location = tx.location;
  property.owner = me;

  // save the property
  const registry = await getAssetRegistry(property.getFullyQualifiedType());
  await registry.add(property);
}

/**
 * Create Intent for sale
 * @param {org.property.registration.intentForSale} tx
 * @transaction
 */
async function intentForSale(tx) {
  const factory = getFactory();
  const NS = 'org.property.registration';
  const me = getCurrentParticipant();

  const assetRegistry = await getAssetRegistry('org.property.registration.Property');
  const listingsRegistry = await getAssetRegistry('org.property.registration.PropertyListing');

  // 1. If the property Id provided, does not exist, return error message
  const currentProperty = await assetRegistry.get(tx.property.PID);
  if (!currentProperty) throw new Error('The property with this ID does not exist');

  // 2. Make sure the Property provided is not already listed, if so, throw an error
  const allListings = await listingsRegistry.getAll();
  let isCurrentPropertyListed = false;

  allListings.forEach(listing => {
    if (listing.property.getIdentifier() == tx.property.PID)
      isCurrentPropertyListed = true;
  });

  if (isCurrentPropertyListed)
    throw new Error('The property with current ID is already listed for sale');

  // 3. Make sure the property belongs to the initiator of this transaction
  if (currentProperty.owner.getIdentifier() != me.userId)
    throw new Error('Only the property owner is allowed to list the property for sale');

  // 4. Update the status of the property to 'Intent for sale' 
  currentProperty.status = 'Intent For Sale';
  await assetRegistry.update(currentProperty);

  // 5. Create and Persist the Property Listing
  const propertyListing = factory.newResource(NS, 'PropertyListing', tx.PLID);
  propertyListing.property = currentProperty;
  await listingsRegistry.add(propertyListing);
}

/**
 * Purchase Property transaction
 * @param {org.property.registration.purchaseProperty} tx
 * @transaction
 */
async function purchaseProperty(tx) {
  const me = getCurrentParticipant();
  const listingsRegistry = await getAssetRegistry('org.property.registration.PropertyListing');
  const propertyRegistry = await getAssetRegistry('org.property.registration.Property');
  const participantRegistry = await getParticipantRegistry('org.property.registration.User');


  // 1. Check if the listing is valid, else throw Error.
  const isCurrentListingValid = await listingsRegistry.exists(tx.propertyListing.PLID);
  if (!isCurrentListingValid) throw new Error('The Listing with the provided ID does not exist');

  // 2. Make sure currentUser is not the same as the property owner.
  const currentListing = await listingsRegistry.get(tx.propertyListing.PLID);
  const currentProperty = await propertyRegistry.get(currentListing.property.getIdentifier());
  const currentPropOwner = await participantRegistry.get(currentProperty.owner.getIdentifier());

  if (me.userId == currentPropOwner.userId) throw new Error('The original owner of the property cannot purchase his own property');

  // 3. Make sure the new buyer has sufficient balance to purchase the property
  if (me.balance < currentProperty.marketPrice) throw new Error('Insufficient Balance');

  // 4. Adjust the new buyer's balance and update the original owner's balance
  currentPropOwner.balance += currentProperty.marketPrice;
  me.balance -= currentProperty.marketPrice;

  await participantRegistry.update(currentPropOwner);
  await participantRegistry.update(me);

  // 5. Update the property details with new owner and persist the transaction.
  currentProperty.owner = me;
  currentProperty.status = 'Registered';
  await propertyRegistry.update(currentProperty);

  // 6. Remove the property / propertyListing from the properyListing registry
  await listingsRegistry.remove(tx.propertyListing.PLID);

}