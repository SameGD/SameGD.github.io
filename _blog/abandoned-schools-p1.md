---
title: Abandoned Victorian Schools (Part 1)
date: 2020-11-09 20:41:00+11
---
While surfing the internet, I found [this](https://www.theage.com.au/national/victoria/vandalism-and-drug-use-hit-derelict-school-sites-across-victoria-20140405-365pn.html) article from The Age in 2014, which talks about the rise of vandalism in derelict school sites across Victoria. While this is otherwise just a typical “societal decay” scare piece, it had a quote which I found interesting:

“A department spokesman gave no detail about when the schools would be sold. The department holds 178 vacated schools.”

Hmmm, so essentially what they’re saying is that there could be as many as 178 abandoned schools in Victoria just waiting to be explored? I think this warrants some further investigation. 

---

This article is 6 years old as of the time I’m writing this post, so the actual number is probably considerably less than that now, considering the Department of Education was actively trying to sell them when the article was written, and many of them likely were demolished to facilitate this. Moreso, the vandalism described in the article actually is kind of a problem because if there’s one truth in this world, it’s that given enough time [all vandalism will eventually turn to arson](https://www.theage.com.au/national/victoria/fire-at-old-clayton-primary-school-building-deemed-suspicious-20170114-gtrhwq.html). Even so, with 178 possible sites, surely some of them have survived in their former glory?

So first we actually need to figure out which schools were abandoned, and where they are. Luckily for me, someone already did the work! Using this incredible site, [Learning From the Past](http://learningfromthepast.com.au), we can see a list of all the lost schools from both the 1990’s and the 21<sup>st</sup> Century. They’ve done a really incredible job in finding all these schools and giving a short history for all them, so I really recommend you check the website out yourself 

Next, we have to figure out which of them are still standing. For this, I’ll be using the [21st Century List of Schools](http://learningfromthepast.com.au/lost-schools-21st-century/), since I feel like there’s a greater chance of them still existing in 2020. That being said, I might go through the 1990 List at some other point. So, here’s the results of my brief skimming of the list:

<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Fate</th>
      <th>Still Standing?</th>
    </tr>
  </thead>
  <tbody>
    {% for school in site.data.closed-victorian-schools %}
    {% if school.visitable == false or school.visitable == "Probably Not" %}
      <tr class="has-background-danger-light">
    {% elsif school.visitable == "Maybe" or school.visitable == "Probably" or school.visitable == "Kind Of" %}
      <tr class="has-background-warning-light">
    {% elsif school.visitable == true %}
      <tr class="has-background-success-light">
    {% else %}
      <tr>
    {% endif %}
        <td>{{ school.name}}</td>
        <td>{{ school.fate }}</td>
        <td>{{ school.visitable | replace: false, 'No' | replace: true, 'Yes'}}</td>
      </tr>
    {% endfor %}
  </tbody>
</table>

Looking at the results, out of the 173 schools on the list, 98 are probably gone, 73 are maybes, and 2 are yes’s. That being said, I was definitely overgenerous with giving out maybes, so the final total is likely much lower. A surprising amount of these schools probably would still be standing if people hadn’t decided to commit arson, which a) really sucks, and b) means that the original article was actually correct. I can’t believe that I lived to see the day where The Age posted factual information. I’m actually starting to have a sneaking suspicion that the 1990 list might end up having more sites still standing, just because older sites would be more of a hassle to demolish (asbestos).

I was originally going to investigate the maybes in this post but they turned out to be really tedious to find, so I’ll post a part 2 soon that covers them. To cap off this post, I’ll talk about the two definite yes’s in the table, Barongarook Primary School and Clarkefield Primary School.

---

**Barongarook Primary School**

According to this [free excerpt of an article from a local newspaper](https://colacherald.com.au/2018/07/former-school-lies-abandoned/), Barongarook Primary School is both still standing, and unused. Looking at it’s address ( 275 Barongarook Rd, Barongarook) on Maps corroborates this article,  and looking at street view we can see that it’s in fairly good condition. Unfortunately though, it looks kinda small, so it might not be that interesting to see in person. 

![Barongarook Primary School](/assets/images/blog/abandoned-schools/barongarook.jpg "Barongarook Primary School")

**Clarkefield Primary School**

Clarkefield Primary School is also in pretty decent condition, looking at its address (1202 Lancefield Rd, Clarkefield) on Maps. Again, it looks fairly small, but there’s really no way of telling from the streetview photo. Unfortunately though, this might not be standing for much longer. According to [this](https://sunburymacedonranges.starweekly.com.au/news/development-fears-for-former-school-site/) article I found, “demolition” fences were put around the school earlier this year, which probably isn’t a good sign considering the department of education’s love of selling property. 

![Clarkefield Primary School](/assets/images/blog/abandoned-schools/clarkefield.jpg "Clarkefield Primary School")

---

It’s pretty interesting seeing all these Victorian schools that have shut down, especially since you never hear about these sort of things in the news. The ironic part of this is that since most of these schools were shut down because of low attendance numbers, they’ll probably have to be replaced as Victoria's population grows. Seems kind of short sighted, but hey, that’s the Australian Government for you. 

Anyways, tune in next time for my investigations into the maybe pile! Mystery, intrigue, excitement, lack of proofreading, part 2 of abandoned victorian schools will have it all! Assuming of course, that I don’t lose interest and work on something else.