# Hyperledger assignment - Upgrad

## Steps to test the code on composer playground - 

1. Copy paste all the code from each of the files to the relevant files on the playground, then click on **Deploy Changes** button at the bottom.

2. Visit the **Test** Tab.

3. From the Participants list in the menu on the left, click on **User**. Then **create new participant**. It should look like the image below -

<img width="703" alt="Screen Shot 2019-09-16 at 12 32 46 PM" src="https://user-images.githubusercontent.com/16633104/64947846-e6265580-d886-11e9-9fa5-646b7ba1b732.png">

  
4. Visit **ID registry** from the top right menu and log in as this newly created user.

<img width="1680" alt="Screen Shot 2019-09-16 at 12 33 41 PM" src="https://user-images.githubusercontent.com/16633104/64947847-e6beec00-d886-11e9-9312-6873122cfb2d.png">

5. Then click on **Submit Transaction** button and in the modal make sure *Transaction type* is selected as "Create Property". Then fill out the details as shown in the image and submit. This will create a new property, which can be seen under **Assets -> Property**

<img width="704" alt="Screen Shot 2019-09-16 at 12 54 24 PM" src="https://user-images.githubusercontent.com/16633104/64947848-e6beec00-d886-11e9-859b-f4be0615546e.png">

6. Now we want to list this Property for sale, so click on "Submit Transaction" again, then from the "Transaction Type" Dropdown, select **intentForSale**, the provide the Listing ID and the Property ID that we want to List, like the image below and then click on Submit.  

<img width="702" alt="Screen Shot 2019-09-16 at 1 07 33 PM" src="https://user-images.githubusercontent.com/16633104/64947837-e4f52880-d886-11e9-90bf-c6d304dae0d1.png">

7. You should now be able to see this listing under **Assets -> PropertyListing**. 
  Here there is one important thing to notice - 
  
    *There is a condition in the code that prevents the existing owner from purchasing his own property. Hence, to carry out the `purchaseProperty` transaction, we will need to create another user.*
  
    Let's go ahead and create two new users and mentioned in step 3, so we can test both cases - 
      
      a. A user with Balance more than the Property's Market Price.
      b. Another user with Balance less than the Market Price.


8. **Please Note** - There is a following additional condition added in the `permissions.acl` file, that enables other participants to read the property details if and only if the property is listed for sale and marked as **"intent for sale"**
```
condition: (r.status === 'Registered')
```

9. First login as a 'Poor User' with insufficient Balance, and try to submit transaction **purchaseProperty** while providing the **ID of the respective listing**. You should see the below error then.

<img width="702" alt="Screen Shot 2019-09-16 at 1 27 04 PM" src="https://user-images.githubusercontent.com/16633104/64947840-e58dbf00-d886-11e9-86b4-b5db5c20015f.png">

10. Now login as a 'rich User', and try to undergo the same transaction. This time it should go through successfully.

![transaction](https://user-images.githubusercontent.com/16633104/64947849-e6beec00-d886-11e9-8511-3cddd490f3d5.gif)

11. Now there are 4 changes you should notice - 
    a. **PropertyListing** is now empty.
    <img width="1680" alt="Screen Shot 2019-09-16 at 1 31 57 PM" src="https://user-images.githubusercontent.com/16633104/64947841-e58dbf00-d886-11e9-915d-711296e75b88.png">

    b. Under **Property**, you will notice that the Property owner is changed from `0001` to `0002`.
    <img width="1680" alt="Screen Shot 2019-09-16 at 1 32 22 PM" src="https://user-images.githubusercontent.com/16633104/64947842-e58dbf00-d886-11e9-9a31-73c9216ba7eb.png">

    c. The balance of the rich man has reduced from **50000** to **47000** which correctly adds upto **3000** (Market Price)
    <img width="1314" alt="Screen Shot 2019-09-16 at 1 32 45 PM" src="https://user-images.githubusercontent.com/16633104/64947843-e58dbf00-d886-11e9-99a6-0c67bab2a159.png">

    d. The original owner's balance has now increased from **10000** to **13000**.
    <img width="1316" alt="Screen Shot 2019-09-16 at 1 33 57 PM" src="https://user-images.githubusercontent.com/16633104/64947844-e6265580-d886-11e9-97e0-b277cd02961e.png">


